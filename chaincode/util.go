package main

import (
	"cmp"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/oklog/ulid/v2"
)

// reviewInput represents the input parameters for creating or updating a review
type reviewInput struct {
	ID        string
	Title     string
	Website   string
	Summary   string
	Rating    uint8
	Country   string
	State     string
	Locality  string
	Email     string
	Phone     string
	Positives string // JSON string of array
	Negatives string // JSON string of array
	ExtraInfo string // JSON string of object
}

// commonName gets the common name from the client's certificate
func (s *ReviewContract) commonName(ctx contractapi.TransactionContextInterface) (string, error) {
	clientIdentity, err := cid.New(ctx.GetStub())
	if err != nil {
		return "", fmt.Errorf("failed to get client identity: %v", err)
	}
	cert, err := clientIdentity.GetX509Certificate()
	if err != nil {
		return "", fmt.Errorf("failed to get X.509 certificate: %v", err)
	}
	return cert.Subject.CommonName, nil
}

// verifyExistsAndOwner checks if a review exists and if the caller is the owner
func (s *ReviewContract) verifyExistsAndOwner(ctx contractapi.TransactionContextInterface, id string) (*Review, error) {
	existingReview, err := s.ReadReview(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("the review %s does not exist: %w", id, err)
	}

	userCN, err := s.commonName(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user identity: %v", err)
	}

	if existingReview.UserID != userCN {
		return nil, fmt.Errorf("unauthorized: only the original review creator can update this review")
	}

	return existingReview, nil
}

// validateStringLength validates string length is within limits
func validateStringLength(s string, max int) error {
	if s == "" {
		return fmt.Errorf("value cannot be empty")
	}

	// Special case for country codes
	if max == 2 {
		if len(s) != 2 {
			return fmt.Errorf("country code must be exactly 2 characters")
		}
		return nil
	}

	// Normal case for other string lengths
	if max > 0 && len(s) > max {
		return fmt.Errorf("value exceeds %d chars", max)
	}

	return nil
}

// validateRating validates that rating is between 1 and 10
func validateRating(rating uint8) error {
	if rating < 1 || rating > 10 {
		return fmt.Errorf("rating must be between 1 and 10")
	}
	return nil
}

// validateInput validates all input parameters for a review
func (s *ReviewContract) validateInput(input *reviewInput, isCreate bool) error {
	if isCreate {
		_, err := ulid.ParseStrict(input.ID)
		if err != nil {
			return fmt.Errorf("id isn't ULID: %w", err)
		}
	}

	// Only validate non-empty fields (useful for updates where some fields might be empty)
	if input.Title != "" {
		if err := validateStringLength(input.Title, 128); err != nil {
			return fmt.Errorf("invalid title: %w", err)
		}
	}

	if input.Website != "" {
		// Trim http(s):// and trailing slashes from website
		trimmedWebsite := input.Website
		trimmedWebsite = strings.TrimPrefix(trimmedWebsite, "http://")
		trimmedWebsite = strings.TrimPrefix(trimmedWebsite, "https://")
		trimmedWebsite = strings.TrimSuffix(trimmedWebsite, "/")

		if err := validateStringLength(trimmedWebsite, 64); err != nil {
			return fmt.Errorf("invalid website: %w", err)
		}

		// Update the input with the trimmed website
		input.Website = trimmedWebsite
	}

	if input.Summary != "" {
		if err := validateStringLength(input.Summary, 4096); err != nil {
			return fmt.Errorf("invalid summary: %w", err)
		}
	}

	if input.Rating > 0 {
		if err := validateRating(input.Rating); err != nil {
			return err
		}
	}

	if input.Country != "" {
		if err := validateStringLength(input.Country, 2); err != nil {
			return fmt.Errorf("invalid country: %w", err)
		}
	}

	if input.State != "" {
		if err := validateStringLength(input.State, 32); err != nil {
			return fmt.Errorf("invalid state: %w", err)
		}
	}

	if input.Locality != "" {
		if err := validateStringLength(input.Locality, 32); err != nil {
			return fmt.Errorf("invalid locality: %w", err)
		}
	}

	// Validate JSON arrays if provided
	if input.Positives != "" {
		var positives []string
		if err := json.Unmarshal([]byte(input.Positives), &positives); err != nil {
			return fmt.Errorf("failed to unmarshal positives: %v", err)
		}
	}

	if input.Negatives != "" {
		var negatives []string
		if err := json.Unmarshal([]byte(input.Negatives), &negatives); err != nil {
			return fmt.Errorf("failed to unmarshal negatives: %v", err)
		}
	}

	// Validate extra info JSON if provided
	if input.ExtraInfo != "" {
		var extraInfo map[string]string
		if err := json.Unmarshal([]byte(input.ExtraInfo), &extraInfo); err != nil {
			return fmt.Errorf("invalid extra info JSON: %v", err)
		}
	}

	return nil
}

// parseSliceFromJSONString converts JSON strings to string arrays
func parseSliceFromJSONString(jsonStr string) ([]string, error) {
	if jsonStr == "" {
		return []string{}, nil
	}

	var result []string
	err := json.Unmarshal([]byte(jsonStr), &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON string: %v", err)
	}

	return result, nil
}

// parseMapFromJSONString converts a JSON string to a map
func parseMapFromJSONString(jsonStr string) (map[string]string, error) {
	if jsonStr == "" {
		return nil, nil
	}

	var result map[string]string
	err := json.Unmarshal([]byte(jsonStr), &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON string: %v", err)
	}

	return result, nil
}

// buildReviewFromInput creates a Review object from input parameters
func (s *ReviewContract) buildReviewFromInput(ctx contractapi.TransactionContextInterface, input *reviewInput, existingReview *Review) (*Review, error) {
	userCN, err := s.commonName(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user identity: %v", err)
	}

	positives, err := parseSliceFromJSONString(input.Positives)
	if err != nil {
		return nil, fmt.Errorf("invalid positives: %w", err)
	}

	negatives, err := parseSliceFromJSONString(input.Negatives)
	if err != nil {
		return nil, fmt.Errorf("invalid negatives: %w", err)
	}

	extraInfo, err := parseMapFromJSONString(input.ExtraInfo)
	if err != nil {
		return nil, fmt.Errorf("invalid extra info: %w", err)
	}

	// If it's an update operation (existingReview is not nil)
	if existingReview != nil {
		updatedPositives := existingReview.Positives
		if len(positives) > 0 {
			updatedPositives = positives
		}

		updatedNegatives := existingReview.Negatives
		if len(negatives) > 0 {
			updatedNegatives = negatives
		}

		updatedExtraInfo := existingReview.ExtraInfo
		if extraInfo != nil {
			updatedExtraInfo = extraInfo
		}

		// Create new review with mixed existing and new values
		return &Review{
			ID:        input.ID,
			Title:     cmp.Or(input.Title, existingReview.Title),
			Website:   cmp.Or(input.Website, existingReview.Website),
			Summary:   cmp.Or(input.Summary, existingReview.Summary),
			Rating:    cmp.Or(input.Rating, existingReview.Rating),
			Country:   cmp.Or(input.Country, existingReview.Country),
			State:     cmp.Or(input.State, existingReview.State),
			Locality:  cmp.Or(input.Locality, existingReview.Locality),
			Email:     cmp.Or(input.Email, existingReview.Email),
			Phone:     cmp.Or(input.Phone, existingReview.Phone),
			Positives: updatedPositives,
			Negatives: updatedNegatives,
			ExtraInfo: updatedExtraInfo,
			Votes:     existingReview.Votes,
			Comments:  existingReview.Comments,
			UserID:    existingReview.UserID,
		}, nil
	}

	// Create new review for create operation
	return &Review{
		ID:        input.ID,
		Title:     input.Title,
		Website:   input.Website,
		Summary:   input.Summary,
		Rating:    input.Rating,
		Country:   input.Country,
		State:     input.State,
		Locality:  input.Locality,
		Email:     cmp.Or(input.Email, NOT_SUPPLIED),
		Phone:     cmp.Or(input.Phone, NOT_SUPPLIED),
		Positives: positives,
		Negatives: negatives,
		ExtraInfo: extraInfo,
		Votes:     []Vote{{UserID: userCN, Value: 1}},
		Comments:  []Comment{},
		UserID:    userCN,
	}, nil
}
