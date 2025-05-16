package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/oklog/ulid/v2"
)

// ReviewContract provides functions for managing reviews
type ReviewContract struct {
	contractapi.Contract
}

// QueryResult structure used for handling result of query
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Review
}

type VoteType int8

const (
	Downvote VoteType = iota - 1 // -1
	None                         // 0
	Upvote                       // 1
)

type Vote struct {
	UserID string   `json:"user_id"`
	Value  VoteType `json:"value"`
}

type Comment struct {
	ID      string `json:"id"` // ULID
	UserID  string `json:"user_id"`
	Comment string `json:"comment"` // max 4096 chars
	Votes   []Vote `json:"votes,omitzero"`
}

const (
	NOT_SUPPLIED = "NOT_SUPPLIED"
)

// Review describes basic details of what makes up a simple review
type Review struct {
	ID        string            `json:"id"`                  // ULID
	Title     string            `json:"title"`               // max 128 chars
	Website   string            `json:"website"`             // max 64 chars
	Summary   string            `json:"summary"`             // max 4096 chars
	Rating    uint8             `json:"rating"`              // between 1 and 10
	Country   string            `json:"country"`             // max 2 chars eg BD
	State     string            `json:"state"`               // province, region, county or state. max 32 chars
	Locality  string            `json:"locality"`            // town, city, village, etc. name. max 32 chars
	Email     string            `json:"email,omitzero"`      // max 32 chars
	Phone     string            `json:"phone,omitzero"`      // max 32 chars
	Positives []string          `json:"positives,omitzero"`  // max 32 chars each
	Negatives []string          `json:"negatives,omitzero"`  // max 32 chars each
	ExtraInfo map[string]string `json:"extra_info,omitzero"` // JSON object
	Votes     []Vote            `json:"votes,omitzero"`
	Comments  []Comment         `json:"comments,omitzero"`
	UserID    string            `json:"user_id"` // CommonName in user's MSP certificate
}

// ReviewExists returns true when a review with the specified ID exists in world state
func (s *ReviewContract) ReviewExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	reviewJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return reviewJSON != nil, nil
}

// CreateReview issues a new review to the world state with given details
func (s *ReviewContract) CreateReview(ctx contractapi.TransactionContextInterface,
	id string, title, website, summary, country, state, locality, email, phone, positives, negatives, extraInfo string, rating uint8) error {

	exists, err := s.ReviewExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the review %s already exists", id)
	}

	input := &reviewInput{
		ID:        id,
		Title:     title,
		Website:   website,
		Summary:   summary,
		Rating:    rating,
		Country:   country,
		State:     state,
		Locality:  locality,
		Email:     email,
		Phone:     phone,
		Positives: positives,
		Negatives: negatives,
		ExtraInfo: extraInfo,
	}

	if err := s.validateInput(input, true); err != nil {
		return err
	}

	review, err := s.buildReviewFromInput(ctx, input, nil)
	if err != nil {
		return err
	}

	reviewJSON, err := json.Marshal(review)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, reviewJSON)
}

// ReadReview returns the review stored in the world state with given id
func (s *ReviewContract) ReadReview(ctx contractapi.TransactionContextInterface, id string) (*Review, error) {
	reviewJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %s", err.Error())
	}
	if reviewJSON == nil {
		return nil, fmt.Errorf("the review %s does not exist", id)
	}

	var review Review
	err = json.Unmarshal(reviewJSON, &review)
	if err != nil {
		return nil, err
	}

	return &review, nil
}

// UpdateReview updates an existing review in the world state with provided parameters
func (s *ReviewContract) UpdateReview(ctx contractapi.TransactionContextInterface,
	id string, title, website, summary, country, state, locality, email, phone, positives, negatives, extraInfo string, rating uint8) error {

	existingReview, err := s.verifyExistsAndOwner(ctx, id)
	if err != nil {
		return err
	}

	input := &reviewInput{
		ID:        id,
		Title:     title,
		Website:   website,
		Summary:   summary,
		Rating:    rating,
		Country:   country,
		State:     state,
		Locality:  locality,
		Email:     email,
		Phone:     phone,
		Positives: positives,
		Negatives: negatives,
		ExtraInfo: extraInfo,
	}

	if err := s.validateInput(input, false); err != nil {
		return err
	}

	updatedReview, err := s.buildReviewFromInput(ctx, input, existingReview)
	if err != nil {
		return err
	}

	reviewJSON, err := json.Marshal(updatedReview)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, reviewJSON)
}

// DeleteReview deletes a given review from the world state.
func (s *ReviewContract) DeleteReview(ctx contractapi.TransactionContextInterface, id string) error {
	if _, err := s.verifyExistsAndOwner(ctx, id); err != nil {
		return err
	}
	return ctx.GetStub().DelState(id)
}

// ReadAllReviews returns all reviews found in world state
func (s *ReviewContract) ReadAllReviews(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
	// range query with empty string for startKey and endKey does
	// an open-ended query of all reviews in the chaincode namespace.
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")

	if err != nil {
		return nil, err
	}

	defer func() {
		if closeErr := resultsIterator.Close(); closeErr != nil {
			err = closeErr
		}
	}()

	var results []QueryResult

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		var review Review
		err = json.Unmarshal(queryResponse.Value, &review)
		if err != nil {
			return nil, err
		}

		queryResult := QueryResult{Key: queryResponse.Key, Record: &review}
		results = append(results, queryResult)
	}

	return results, nil
}

// CountReviews helps determine if the ledger is already populated
func (s *ReviewContract) CountReviews(ctx contractapi.TransactionContextInterface) (int, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return 0, err
	}
	defer func() {
		if closeErr := resultsIterator.Close(); closeErr != nil {
			err = closeErr
		}
	}()

	count := 0
	for resultsIterator.HasNext() {
		_, err := resultsIterator.Next()
		if err != nil {
			return 0, err
		}
		count++
	}

	return count, nil
}

// AddComment adds a new comment to an existing review
func (s *ReviewContract) AddComment(ctx contractapi.TransactionContextInterface, reviewID, commentID, commentText string) error {
	_, err := ulid.ParseStrict(reviewID)
	if err != nil {
		return fmt.Errorf("reviewID isn't ULID %w", err)
	}

	_, err = ulid.ParseStrict(commentID)
	if err != nil {
		return fmt.Errorf("commentID isn't ULID %w", err)
	}

	userCN, err := s.commonName(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user identity: %v", err)
	}

	if err := validateStringLength(commentText, 4096); err != nil {
		return err
	}

	newComment := Comment{
		ID:      commentID,
		UserID:  userCN,
		Comment: commentText,
		Votes:   []Vote{{UserID: userCN, Value: 1}},
	}

	review, err := s.ReadReview(ctx, reviewID)
	if err != nil {
		return fmt.Errorf("the review %s does not exist. %w", reviewID, err)
	}

	for _, existingComment := range review.Comments {
		if existingComment.ID == commentID {
			return fmt.Errorf("comment with ID %s already exists", commentID)
		}
	}

	review.Comments = append(review.Comments, newComment)

	reviewJSON, err := json.Marshal(review)
	if err != nil {
		return fmt.Errorf("failed to marshal review: %v", err)
	}

	err = ctx.GetStub().PutState(reviewID, reviewJSON)
	if err != nil {
		return fmt.Errorf("failed to update review state: %v", err)
	}

	return nil
}

// EditComment allows a user to edit their own comment on a review
func (s *ReviewContract) EditComment(ctx contractapi.TransactionContextInterface, reviewID, commentID, newCommentText string) error {
	_, err := ulid.ParseStrict(reviewID)
	if err != nil {
		return fmt.Errorf("reviewID isn't ULID %w", err)
	}

	_, err = ulid.ParseStrict(commentID)
	if err != nil {
		return fmt.Errorf("commentID isn't ULID %w", err)
	}

	if err := validateStringLength(newCommentText, 4096); err != nil {
		return err
	}

	userCN, err := s.commonName(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user identity: %v", err)
	}

	review, err := s.ReadReview(ctx, reviewID)
	if err != nil {
		return fmt.Errorf("the review %s does not exist. %w", reviewID, err)
	}

	commentFound := false
	for i, existingComment := range review.Comments {
		if existingComment.ID == commentID {
			// Check if the current user is the author of the comment
			if existingComment.UserID != userCN {
				return fmt.Errorf("only the comment author can edit the comment")
			}
			// Update the comment text
			review.Comments[i].Comment = newCommentText
			commentFound = true
			break
		}
	}

	if !commentFound {
		return fmt.Errorf("comment with ID %s not found in review %s", commentID, reviewID)
	}

	reviewJSON, err := json.Marshal(review)
	if err != nil {
		return fmt.Errorf("failed to marshal review: %v", err)
	}

	err = ctx.GetStub().PutState(reviewID, reviewJSON)
	if err != nil {
		return fmt.Errorf("failed to update review state: %v", err)
	}

	return nil
}

// DeleteComment allows a user to delete their own comment from a review
func (s *ReviewContract) DeleteComment(ctx contractapi.TransactionContextInterface, reviewID, commentID string) error {
	_, err := ulid.ParseStrict(reviewID)
	if err != nil {
		return fmt.Errorf("reviewID isn't ULID %w", err)
	}
	_, err = ulid.ParseStrict(commentID)
	if err != nil {
		return fmt.Errorf("commentID isn't ULID %w", err)
	}

	userCN, err := s.commonName(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user identity: %v", err)
	}

	review, err := s.ReadReview(ctx, reviewID)
	if err != nil {
		return fmt.Errorf("the review %s does not exist. %w", reviewID, err)
	}

	// Find the comment and verify ownership
	commentIndex := -1
	for i, existingComment := range review.Comments {
		if existingComment.ID == commentID {
			// Check if the current user is the author of the comment
			if existingComment.UserID != userCN {
				return fmt.Errorf("only the comment author can delete the comment")
			}
			commentIndex = i
			break
		}
	}

	// Return error if comment not found
	if commentIndex == -1 {
		return fmt.Errorf("comment with ID %s not found in review %s", commentID, reviewID)
	}

	// Remove the comment using slice manipulation. This efficiently removes the comment at commentIndex without preserving order
	review.Comments[commentIndex] = review.Comments[len(review.Comments)-1]
	review.Comments = review.Comments[:len(review.Comments)-1]

	reviewJSON, err := json.Marshal(review)
	if err != nil {
		return fmt.Errorf("failed to marshal review: %v", err)
	}

	err = ctx.GetStub().PutState(reviewID, reviewJSON)
	if err != nil {
		return fmt.Errorf("failed to update review state: %v", err)
	}

	return nil
}

// Vote allows a user to vote on a review or a comment within a review
// value: 1 for upvote, -1 for downvote, 0 to remove the vote
// commentID is optional - if provided, the vote is for a comment; otherwise, it's for the review
func (s *ReviewContract) Vote(ctx contractapi.TransactionContextInterface, reviewID string, value int8, commentID string) error {
	_, err := ulid.ParseStrict(reviewID)
	if err != nil {
		return fmt.Errorf("reviewID isn't ULID %w", err)
	}

	if value < -1 || value > 1 {
		return fmt.Errorf("invalid vote value: must be -1, 0, or 1")
	}

	userCN, err := s.commonName(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user identity: %v", err)
	}

	review, err := s.ReadReview(ctx, reviewID)
	if err != nil {
		return fmt.Errorf("the review %s does not exist. %w", reviewID, err)
	}

	// Determine if we're voting on a review or a comment
	isCommentVote := commentID != ""

	if isCommentVote {
		_, err := ulid.ParseStrict(commentID)
		if err != nil {
			return fmt.Errorf("commentID isn't ULID %w", err)
		}

		// Find the comment
		commentFound := false
		for i, comment := range review.Comments {
			if comment.ID == commentID {
				commentFound = true

				// Check if user already voted on this comment
				voteIndex := -1
				for j, vote := range comment.Votes {
					if vote.UserID == userCN {
						voteIndex = j
						break
					}
				}

				// Handle the vote based on value
				if value == 0 && voteIndex != -1 {
					// Remove the vote
					review.Comments[i].Votes[voteIndex] = review.Comments[i].Votes[len(comment.Votes)-1]
					review.Comments[i].Votes = review.Comments[i].Votes[:len(comment.Votes)-1]
				} else if value != 0 && voteIndex != -1 {
					// Update the vote
					review.Comments[i].Votes[voteIndex].Value = VoteType(value)
				} else if value != 0 && voteIndex == -1 {
					// Add new vote
					newVote := Vote{
						UserID: userCN,
						Value:  VoteType(value),
					}
					review.Comments[i].Votes = append(review.Comments[i].Votes, newVote)
				}

				break
			}
		}

		if !commentFound {
			return fmt.Errorf("comment with ID %s not found in review %s", commentID, reviewID)
		}
	} else {
		// Check if user already voted on this review
		voteIndex := -1
		for i, vote := range review.Votes {
			if vote.UserID == userCN {
				voteIndex = i
				break
			}
		}

		// Handle the vote based on value
		if value == 0 && voteIndex != -1 {
			// Remove the vote
			review.Votes[voteIndex] = review.Votes[len(review.Votes)-1]
			review.Votes = review.Votes[:len(review.Votes)-1]
		} else if value != 0 && voteIndex != -1 {
			// Update the vote
			review.Votes[voteIndex].Value = VoteType(value)
		} else if value != 0 && voteIndex == -1 {
			// Add new vote
			newVote := Vote{
				UserID: userCN,
				Value:  VoteType(value),
			}
			review.Votes = append(review.Votes, newVote)
		}
	}

	// Save the updated review
	reviewJSON, err := json.Marshal(review)
	if err != nil {
		return fmt.Errorf("failed to marshal review: %v", err)
	}

	err = ctx.GetStub().PutState(reviewID, reviewJSON)
	if err != nil {
		return fmt.Errorf("failed to update review state: %v", err)
	}

	return nil
}

// InitLedger adds a base set of reviews to the ledger
func (s *ReviewContract) InitLedger(ctx contractapi.TransactionContextInterface, addSampleReviews bool) error {
	ReviewCount, err := s.CountReviews(ctx)
	if err != nil {
		return err
	}
	if ReviewCount == 0 && addSampleReviews {
		fmt.Println("ReviewCount", ReviewCount, "adding Sample Reviews")

		// Store reviews in world state using CreateReview
		for _, review := range sampleReviews {
			positivesJSON, err := json.Marshal(review.Positives)
			if err != nil {
				log.Println("Failed to marshal Positives", err)
				return fmt.Errorf("failed to marshal Positives to JSON: %v", err)
			}

			negativesJSON, err := json.Marshal(review.Negatives)
			if err != nil {
				log.Println("Failed to marshal Negatives", err)
				return fmt.Errorf("failed to marshal Negatives to JSON: %v", err)
			}

			extraInfoJSON, err := json.Marshal(review.ExtraInfo)
			if err != nil {
				log.Println("Failed to marshal ExtraInfo", err)
				return fmt.Errorf("failed to marshal ExtraInfo to JSON: %v", err)
			}
			err = s.CreateReview(
				ctx,
				review.ID,
				review.Title,
				review.Website,
				review.Summary,
				review.Country,
				review.State,
				review.Locality,
				review.Email,
				review.Phone,
				string(positivesJSON),
				string(negativesJSON),
				string(extraInfoJSON),
				review.Rating,
			)
			if err != nil {
				log.Println("InitLedger failed", err)
				return fmt.Errorf("failed to create review: %v", err)
			}
		}
	}

	return nil
}

func (s *ReviewContract) AddSampleComments(ctx contractapi.TransactionContextInterface) error {
	reviewCounts, err := s.CountReviews(ctx)
	if err != nil {
		log.Println("Failed to CountReviews", err)
		return fmt.Errorf("failed to CountReviews: %v", err)
	}
	if reviewCounts != 5 {
		log.Println("expected reviewCounts 5, got", reviewCounts)
		return fmt.Errorf("expected 5 reviews, got %d", reviewCounts)
	}

	// TODO: FIX - it adds only one comment instead of two
	for _, reviewComments := range sampleComments {
		for _, comment := range reviewComments.Comments {
			err = s.AddComment(ctx, reviewComments.ReviewID, comment.ID, comment.Comment)
			if err != nil {
				log.Println("Failed to add comment", err)
				return fmt.Errorf("failed to add comment: %v", err)
			}
		}
	}

	return nil
}
