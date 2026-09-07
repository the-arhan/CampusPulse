// ============================================================
// CampusPulse — newsData.js
//
// TEMPORARY MOCK DATA
// ------------------------------------------------------------
// This file stands in for the future GET /api/news endpoint.
// Every item below is fictional demo content — it should never
// be presented as real campus information.
//
// When the backend is ready, the backend developer does NOT
// need to touch this file or any UI code. They only need to
// replace the implementation of getLatestNews() in api.js so it
// fetches from the real endpoint instead of returning MOCK_NEWS.
// See the comment above getLatestNews() in api.js for details.
//
// Expected item shape (this is the contract the UI is built
// against — keep it unchanged so nothing downstream breaks):
//   {
//     id:        string,
//     title:     string,
//     excerpt:   string,
//     category:  string,
//     date:      ISO 8601 string,
//     imageUrl:  string | null,
//     isPinned:  boolean
//   }
// ============================================================

const MOCK_NEWS = [
  {
    id: "news-001",
    title: "Orientation Week Schedule Released for Incoming Batch",
    excerpt: "The college has published the full orientation schedule, including hostel check-in times, campus tours, and department welcome sessions.",
    category: "Campus",
    date: "2026-09-05T10:00:00Z",
    imageUrl: null,
    isPinned: true
  },
  {
    id: "news-002",
    title: "Semester Fee Payment Deadline Extended by One Week",
    excerpt: "Following requests from the student council, the fee payment deadline has been pushed back to give students extra time to complete online payments.",
    category: "Administration",
    date: "2026-09-04T09:30:00Z",
    imageUrl: null,
    isPinned: true
  },
  {
    id: "news-003",
    title: "Central Library Extends Weekday Hours Until Midnight",
    excerpt: "With exams approaching, the central library will stay open until midnight on weekdays for the rest of the semester.",
    category: "Facilities",
    date: "2026-09-03T14:15:00Z",
    imageUrl: null,
    isPinned: false
  },
  {
    id: "news-004",
    title: "Inter-Department Sports Fest Registrations Now Open",
    excerpt: "Teams can now register for this year's inter-department sports fest, featuring cricket, football, badminton, and athletics events.",
    category: "Events",
    date: "2026-09-02T11:00:00Z",
    imageUrl: null,
    isPinned: false
  },
  {
    id: "news-005",
    title: "New Shuttle Route Added for North Campus Hostels",
    excerpt: "A new shuttle route now connects North Campus hostels directly to the Engineering block, with buses running every 15 minutes during peak hours.",
    category: "Transport",
    date: "2026-09-01T08:45:00Z",
    imageUrl: null,
    isPinned: false
  },
  {
    id: "news-006",
    title: "Campus-Wide Wi-Fi Infrastructure Upgrade This Weekend",
    excerpt: "IT services will be upgrading network hardware across campus this weekend. Brief connectivity interruptions are expected between 1–5 AM on Saturday.",
    category: "IT & Tech",
    date: "2026-08-30T16:20:00Z",
    imageUrl: null,
    isPinned: false
  },
  {
    id: "news-007",
    title: "Campus Safety Walk Introduced for Late-Night Library Users",
    excerpt: "A new volunteer-run safety walk service will accompany students back to their hostels after late-night library sessions, starting next week.",
    category: "Safety",
    date: "2026-08-28T13:00:00Z",
    imageUrl: null,
    isPinned: false
  }
];
