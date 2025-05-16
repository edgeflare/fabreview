package main

import "github.com/oklog/ulid/v2"

var sampleReviews = []Review{
	{
		ID:       ulid.MustParseStrict("01JV9YJ27TPWZJJ4EW4MR7V27N").String(),
		Title:    "Exceptional Tech Support Service with Quick Response Times and Expert Solutions",
		Website:  "https://technobd.com/",
		Summary:  "Outstanding IT services with remarkably prompt response times. Their technical team solved our complex server infrastructure issues within hours. The support staff maintained clear communication throughout the resolution process and provided detailed documentation for future reference. Highly recommended for critical IT support needs.",
		Rating:   9,
		Country:  "BD",
		State:    "Dhaka",
		Locality: "Gulshan",
		Email:    "support@technobd.com",
		Phone:    "+880123456789",
		Positives: []string{
			"24/7 availability",
			"Knowledgeable staff",
			"Fast problem resolution",
		},
		Negatives: []string{
			"Slightly expensive",
			"Limited weekend support",
		},
		ExtraInfo: map[string]string{
			"response_time":     "2 hours",
			"satisfaction_rate": "98%",
			"support_channels":  "email, phone, chat",
		},
	},
	{
		ID:       ulid.MustParseStrict("01JV9YJNR0K1SG40VSTVX5VT3J").String(),
		Title:    "Mediocre Web Development Services with Acceptable Delivery Timeframes",
		Website:  "bangladeshtech.com",
		Summary:  "Project delivered on time but with several troubling issues. The website had multiple responsiveness problems on mobile devices and significant loading speed concerns. While the core functionality worked as requested, the codebase appeared poorly structured with minimal comments. The team was communicative during development but became less responsive when addressing post-launch bugs.",
		Rating:   5,
		Country:  "BD",
		State:    "Dhaka",
		Locality: "Banani",
		Email:    "info@bangladeshtech.com",
		Phone:    "+880187654321",
		Positives: []string{
			"On-time delivery",
			"Reasonable pricing",
			"Good communication",
		},
		Negatives: []string{
			"Mediocre code quality",
			"Lack of documentation",
			"Limited post-launch support",
		},
		ExtraInfo: map[string]string{
			"project_duration": "3 months",
			"technologies":     "PHP, WordPress, jQuery",
			"team_size":        "4 developers",
		},
	},
	{
		ID:       ulid.MustParseStrict("01JV9YK3DFKFA0DE2RYMNEJCTM").String(),
		Title:    "Disappointing Software Development with Numerous Quality Issues and Bugs",
		Website:  "http://dhakadigital.com/",
		Summary:  "Many bugs in the delivered software severely impacted our business operations. The ERP system crashed frequently during peak usage hours and contained numerous calculation errors in the financial module. Data integrity issues were discovered after deployment, requiring manual verification of records. Despite multiple requests for fixes, the development team responded slowly and often introduced new bugs while fixing old ones.",
		Rating:   4,
		Country:  "BD",
		State:    "Dhaka",
		Locality: "Mirpur",
		Email:    "contact@dhakadigital.com",
		Phone:    "+880198765432",
		Positives: []string{
			"Affordable rates",
			"Flexible schedule",
		},
		Negatives: []string{
			"Buggy code",
			"Poor testing procedures",
			"Slow bug fixes",
		},
		ExtraInfo: map[string]string{
			"project_type":   "ERP system",
			"deadline_met":   "no",
			"bug_count":      "47",
			"refund_offered": "partial",
		},
	},
	{
		ID:       ulid.MustParseStrict("01JV9YKKV29A09ES4JXN968NV8").String(),
		Title:    "Effective IT Training with Hands-on Approach and Practical Industry Knowledge",
		Website:  "https://banglasoft.net/",
		Summary:  "Helpful training sessions with comprehensive practical exercises that truly reinforced theoretical concepts. The instructors had substantial industry experience and shared relevant real-world scenarios throughout the course. Training materials were well-organized, though slightly outdated in some modules. The post-training support was beneficial, with instructors remaining available for questions for two weeks after completion.",
		Rating:   7,
		Country:  "BD",
		State:    "Chittagong",
		Locality: "Agrabad",
		Email:    "training@banglasoft.net",
		Phone:    "+880176543210",
		Positives: []string{
			"Practical exercises",
			"Industry-relevant content",
			"Skilled instructors",
		},
		Negatives: []string{
			"Outdated course materials",
			"Limited class size",
		},
		ExtraInfo: map[string]string{
			"courses_offered":         "Java, Python, DevOps",
			"certification":           "yes",
			"job_placement_rate":      "72%",
			"average_course_duration": "6 weeks",
		},
	},
	{
		ID:       ulid.MustParseStrict("01JV9YM472FG0BD8D67Z612TRK").String(),
		Title:    "Reliable Mobile App Development with Cross-Platform Compatibility and Smooth Performance",
		Website:  "sylhettech.com/",
		Summary:  "The mobile app works smoothly across all tested devices with impressive performance metrics. User experience is intuitive with well-designed navigation flows and visually appealing interfaces. Backend integration functions reliably with our existing systems, though occasional sync delays occur during heavy traffic periods. Despite the timeline extensions, the final product demonstrates excellent attention to detail and meets all our functional requirements.",
		Rating:   7,
		Country:  "BD",
		State:    "Sylhet",
		Locality: "Zindabazar",
		Email:    "dev@sylhettech.com",
		Phone:    "+880165432109",
		Positives: []string{
			"Cross-platform compatibility",
			"Clean UI/UX design",
			"Good performance",
		},
		Negatives: []string{
			"Delayed project timeline",
			"Higher than quoted price",
		},
		ExtraInfo: map[string]string{
			"app_platform":   "Android, iOS",
			"tech_stack":     "React Native, Firebase",
			"app_size":       "24MB",
			"support_period": "12 months",
		},
	},
}

var sampleComments = []struct {
	ReviewID string
	Comments []Comment
}{
	{
		ReviewID: sampleReviews[0].ID,
		Comments: []Comment{
			{
				ID:      ulid.MustParseStrict("01JV9Z0AMVY4V0TH8KQBKD995G").String(),
				Comment: "I completely agree with this review. Their response time was phenomenal, and they resolved our network issues within hours.",
			},
			{
				ID:      ulid.MustParseStrict("01JV9Z0NTAENPXGNCST7YV9DK1").String(),
				Comment: "We've been using their services for over a year now. While they are indeed expensive, the quality of support is worth every penny.",
			},
		},
	},
	{
		ReviewID: sampleReviews[1].ID,
		Comments: []Comment{
			{
				ID:      ulid.MustParseStrict("01JV9Z0ZRCCXV7H513MKAWM12P").String(),
				Comment: "We had a similar experience. The initial communication was promising, but the quality of code was subpar.",
			},
			{
				ID:      ulid.MustParseStrict("01JV9Z1B8897J5P7H6RZ9ZQJHJ").String(),
				Comment: "Their prices are indeed reasonable, but I would have paid more for better code quality and documentation.",
			},
		},
	},
	{
		ReviewID: sampleReviews[2].ID,
		Comments: []Comment{
			{
				ID:      ulid.MustParseStrict("01JV9Z1PSQS330CBNXWR43GSDA").String(),
				Comment: "We had to hire another team to fix all the bugs in our system. Total waste of time and money.",
			},
			{
				ID:      ulid.MustParseStrict("01JV9Z22VJHYX1PH7VYXNY2SB8").String(),
				Comment: "Their customer service was apologetic but unable to fix critical issues in our implementation.",
			},
		},
	},
	{
		ReviewID: sampleReviews[3].ID,
		Comments: []Comment{
			{
				ID:      ulid.MustParseStrict("01JV9Z2ESK7Y0KMYEJR5PMEYNP").String(),
				Comment: "The practical approach to training was refreshing. Our team learned applicable skills they could use immediately.",
			},
			{
				ID:      ulid.MustParseStrict("01JV9Z2TP3W35XWVZ223RJ8SQW").String(),
				Comment: "I appreciated how the instructors incorporated real-world scenarios into the training materials.",
			},
		},
	},
	{
		ReviewID: sampleReviews[4].ID,
		Comments: []Comment{
			{
				ID:      ulid.MustParseStrict("01JV9Z37QFRS8NB628TFV4K79S").String(),
				Comment: "The app performs well across all our test devices. The React Native implementation is clean and efficient.",
			},
			{
				ID:      ulid.MustParseStrict("01JV9Z3HPSF6JR03Z1MPCB2H2W").String(),
				Comment: "While the delay in delivery was frustrating, the final product exceeded our expectations in terms of performance.",
			},
		},
	},
}
