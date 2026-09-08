// ============================================================
// CampusPulse — Firebase API
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCDNuD31TsD52fsqfNQFrSy09U-lrijGmE",
  authDomain: "campuspulse-a6196.firebaseapp.com",
  projectId: "campuspulse-a6196",
  storageBucket: "campuspulse-a6196.firebasestorage.app",
  messagingSenderId: "388609400319",
  appId: "1:388609400319:web:b1b7d88f584e0342941bca",
  measurementId: "G-1N0BRW20ZB"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const CampusPulseAPI = (() => {

  const ISSUES_COLLECTION = "Issues";
  const IDENTITY_KEY = "campuspulse_identity_v2";
  const MY_REPORTS_KEY = "campuspulse_my_reports_v2";
  const MY_AFFECTED_KEY = "campuspulse_my_affected_v2";
  const MY_HELPFUL_KEY = "campuspulse_my_helpful_v2";

  // ---------------- Helpers ----------------

  function delay(value) {
    return new Promise(resolve => setTimeout(() => resolve(value), 150));
  }

  function readSet(key) {
    try {
      return new Set(JSON.parse(localStorage.getItem(key)) || []);
    } catch (e) {
      return new Set();
    }
  }

  function writeSet(key, set) {
    localStorage.setItem(key, JSON.stringify([...set]));
  }

  // ---------------- Identity ----------------

  function getOrCreateIdentity() {
    const saved = localStorage.getItem(IDENTITY_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }

    const adjective =
      IDENTITY_ADJECTIVES[
        Math.floor(Math.random() * IDENTITY_ADJECTIVES.length)
      ];

    const noun =
      IDENTITY_NOUNS[
        Math.floor(Math.random() * IDENTITY_NOUNS.length)
      ];

    const number = String(Math.floor(100 + Math.random() * 900));

    const identity = {
      name: `${adjective} ${noun}`,
      number,
      display: `${adjective} ${noun} #${number}`
    };

    localStorage.setItem(
      IDENTITY_KEY,
      JSON.stringify(identity)
    );

    return identity;
  }

  // ---------------- Issues ----------------

  async function getIssues() {
    const snapshot = await db
      .collection(ISSUES_COLLECTION)
      .orderBy("createdAt", "desc")
      .get();

    const issues = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        ...data,
        id: data.issueId || doc.id,

        createdAt:
          data.createdAt && data.createdAt.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,

        updatedAt:
          data.updatedAt && data.updatedAt.toDate
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,

        affectedCount: data.affectedCount || 0,
        solutions: data.solutions || [],
        firstYear: data.firstYear || false,
        triedBefore: data.triedBefore || "",
        anonAuthor: data.anonAuthor || "Anonymous Student"
      };
    });

    return delay(issues);
  }

  async function getIssue(id) {
    const snapshot = await db
      .collection(ISSUES_COLLECTION)
      .where("issueId", "==", id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return delay(null);
    }

    const data = snapshot.docs[0].data();

    return delay({
      ...data,
      id: data.issueId || snapshot.docs[0].id,
      solutions: data.solutions || [],
      affectedCount: data.affectedCount || 0
    });
  }

  // ---------------- Create Issue ----------------

  async function createIssue(issueData) {

    const identity = getOrCreateIdentity();

    const issueId =
      "issue-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 1000);

    const now = firebase.firestore.Timestamp.now();

    const newIssue = {

      issueId,

      userId: identity.number,

      category: issueData.category,

      status: "new",

      urgency: issueData.urgency,

      firstYear: false,

      title: issueData.title,

      description: issueData.description,

      location:
        issueData.location || "Not specified",

      createdAt: now,

      updatedAt: now,

      affectedCount: 1,

      anonAuthor: identity.display,

      triedBefore:
        issueData.triedBefore || "",

      solutions: []
    };

    await db
      .collection(ISSUES_COLLECTION)
      .doc(issueId)
      .set(newIssue);

    const myReports = readSet(MY_REPORTS_KEY);
    myReports.add(issueId);
    writeSet(MY_REPORTS_KEY, myReports);

    const myAffected = readSet(MY_AFFECTED_KEY);
    myAffected.add(issueId);
    writeSet(MY_AFFECTED_KEY, myAffected);

    return delay({
      ...newIssue,
      id: issueId,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString()
    });
  }

  // ---------------- Affected / Me Too ----------------

  async function toggleAffected(issueId) {

    const snapshot = await db
      .collection(ISSUES_COLLECTION)
      .doc(issueId)
      .get();

    if (!snapshot.exists) {
      return delay(null);
    }

    const issue = snapshot.data();

    const myAffected = readSet(MY_AFFECTED_KEY);
    const alreadyMarked = myAffected.has(issueId);

    let newCount =
      Number(issue.affectedCount || 0);

    if (alreadyMarked) {
      newCount = Math.max(0, newCount - 1);
      myAffected.delete(issueId);
    } else {
      newCount += 1;
      myAffected.add(issueId);
    }

    await db
      .collection(ISSUES_COLLECTION)
      .doc(issueId)
      .update({
        affectedCount: newCount,
        updatedAt: firebase.firestore.Timestamp.now()
      });

    writeSet(MY_AFFECTED_KEY, myAffected);

    return delay({
      issue: {
        ...issue,
        id: issueId,
        affectedCount: newCount
      },
      marked: !alreadyMarked
    });
  }

  function isAffectedByMe(issueId) {
    return readSet(MY_AFFECTED_KEY).has(issueId);
  }

  function isReportedByMe(issueId) {
    return readSet(MY_REPORTS_KEY).has(issueId);
  }

  function getMyReportIds() {
    return [...readSet(MY_REPORTS_KEY)];
  }

  function getMyAffectedIds() {
    return [...readSet(MY_AFFECTED_KEY)];
  }

  // ---------------- Solutions ----------------

  async function addSolution(issueId, content) {

    const snapshot = await db
      .collection(ISSUES_COLLECTION)
      .doc(issueId)
      .get();

    if (!snapshot.exists) {
      return delay(null);
    }

    const issue = snapshot.data();
    const identity = getOrCreateIdentity();

    const solution = {
      id:
        "sol-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000),

      content,

      anonAuthor: identity.display,

      helpfulCount: 0,

      notHelpfulCount: 0,

      createdAt:
        new Date().toISOString()
    };

    const solutions =
      issue.solutions || [];

    solutions.push(solution);

    await db
      .collection(ISSUES_COLLECTION)
      .doc(issueId)
      .update({
        solutions,
        updatedAt:
          firebase.firestore.Timestamp.now()
      });

    return delay(solution);
  }

  // ---------------- Helpful / Not Helpful ----------------

  async function markSolutionHelpful(
    issueId,
    solutionId,
    helpful
  ) {

    const snapshot = await db
      .collection(ISSUES_COLLECTION)
      .doc(issueId)
      .get();

    if (!snapshot.exists) {
      return delay(null);
    }

    const issue = snapshot.data();

    const solutions =
      issue.solutions || [];

    const solution =
      solutions.find(
        s => s.id === solutionId
      );

    if (!solution) {
      return delay(null);
    }

    const myHelpful = JSON.parse(
      localStorage.getItem(MY_HELPFUL_KEY) || "{}"
    );

    const prevVote =
      myHelpful[solutionId];

    if (prevVote === "helpful") {
      solution.helpfulCount =
        Math.max(
          0,
          (solution.helpfulCount || 0) - 1
        );
    }

    if (prevVote === "not-helpful") {
      solution.notHelpfulCount =
        Math.max(
          0,
          (solution.notHelpfulCount || 0) - 1
        );
    }

    if (
      prevVote ===
      (helpful ? "helpful" : "not-helpful")
    ) {

      delete myHelpful[solutionId];

    } else {

      if (helpful) {

        solution.helpfulCount =
          (solution.helpfulCount || 0) + 1;

      } else {

        solution.notHelpfulCount =
          (solution.notHelpfulCount || 0) + 1;
      }

      myHelpful[solutionId] =
        helpful
          ? "helpful"
          : "not-helpful";
    }

    await db
      .collection(ISSUES_COLLECTION)
      .doc(issueId)
      .update({
        solutions,
        updatedAt:
          firebase.firestore.Timestamp.now()
      });

    localStorage.setItem(
      MY_HELPFUL_KEY,
      JSON.stringify(myHelpful)
    );

    return delay(solution);
  }

  function myHelpfulVote(solutionId) {

    const myHelpful = JSON.parse(
      localStorage.getItem(MY_HELPFUL_KEY) || "{}"
    );

    return myHelpful[solutionId] || null;
  }

  // ---------------- Insights ----------------

  async function getInsights() {

    const issues = await getIssues();

    const now = Date.now();

    const WEEK =
      7 * 86400000;

    const total =
      issues.length;

    const resolved =
      issues.filter(
        i => i.status === "resolved"
      ).length;

    const totalAffected =
      issues.reduce(
        (sum, i) =>
          sum + Number(i.affectedCount || 0),
        0
      );

    const totalSolutions =
      issues.reduce(
        (sum, i) =>
          sum + (i.solutions || []).length,
        0
      );

    const mostReportedThisWeek =
      [...issues]
        .filter(
          i =>
            now -
              new Date(i.createdAt).getTime()
            <= WEEK
        )
        .sort(
          (a, b) =>
            b.affectedCount -
            a.affectedCount
        )
        .slice(0, 5);

    const firstYearChallenges =
      [...issues]
        .filter(i => i.firstYear)
        .sort(
          (a, b) =>
            b.affectedCount -
            a.affectedCount
        )
        .slice(0, 5);

    const hotspotMap = {};

    issues.forEach(i => {

      const location =
        i.location || "Not specified";

      hotspotMap[location] =
        (hotspotMap[location] || 0) +
        Number(i.affectedCount || 0);
    });

    const hotspots =
      Object.entries(hotspotMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(
          ([location, affected]) => ({
            location,
            affected
          })
        );

    const allSolutions = [];

    issues.forEach(i => {

      (i.solutions || []).forEach(s => {

        allSolutions.push({
          ...s,
          issueTitle: i.title,
          issueId: i.id
        });

      });

    });

    const mostHelpfulSolutions =
      allSolutions
        .sort(
          (a, b) =>
            (b.helpfulCount || 0) -
            (a.helpfulCount || 0)
        )
        .slice(0, 5);

    const byCategory = {};

    issues.forEach(i => {

      byCategory[i.category] =
        (byCategory[i.category] || 0) + 1;

    });

    const byStatus = {
      "new": 0,
      "in-review": 0,
      "in-progress": 0,
      "resolved": 0
    };

    issues.forEach(i => {

      byStatus[i.status] =
        (byStatus[i.status] || 0) + 1;

    });

    return delay({
      total,
      resolved,
      totalAffected,
      totalSolutions,
      mostReportedThisWeek,
      firstYearChallenges,
      hotspots,
      mostHelpfulSolutions,
      byCategory,
      byStatus
    });
  }

  // ---------------- News ----------------

  function getLatestNews() {
    return delay(MOCK_NEWS);
  }

  return {

    getOrCreateIdentity,

    getIssues,
    getIssue,
    createIssue,

    toggleAffected,
    isAffectedByMe,
    isReportedByMe,
    getMyReportIds,
    getMyAffectedIds,

    addSolution,
    markSolutionHelpful,
    myHelpfulVote,

    getInsights,

    getLatestNews

  };

})();
