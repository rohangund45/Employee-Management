/**
 * Integration Test Script
 * Run with: node test-api.js
 * 
 * Tests all API endpoints against a running server.
 * Make sure seed.js has been run first.
 */

const http = require("http");

const BASE = "http://localhost:5000/api";
let adminToken = "";
let employeeToken = "";
let testResults = [];

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (token) options.headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function test(name, status, expected, actual) {
  const pass = status === expected;
  const icon = pass ? "✅" : "❌";
  testResults.push({ name, pass });
  console.log(`  ${icon} ${name} — ${status} (expected ${expected})`);
  return pass;
}

async function run() {
  console.log("\n🧪 EMS Integration Tests\n" + "═".repeat(50));

  // ── AUTH ──
  console.log("\n📌 Auth Module");

  let res = await request("POST", "/auth/login", { email: "admin@ems.com", password: "Admin@123" });
  test("Admin login", res.status, 200);
  adminToken = res.data?.data?.token;

  res = await request("POST", "/auth/login", { email: "rahul@ems.com", password: "Employee@123" });
  test("Employee login", res.status, 200);
  employeeToken = res.data?.data?.token;

  res = await request("POST", "/auth/login", { email: "wrong@ems.com", password: "wrong" });
  test("Invalid login rejected", res.status, 401);

  res = await request("GET", "/auth/me", null, adminToken);
  test("Get admin profile", res.status, 200);

  res = await request("GET", "/auth/me", null, employeeToken);
  test("Get employee profile", res.status, 200);

  // ── EMPLOYEES ──
  console.log("\n📌 Employees Module");

  res = await request("GET", "/employees", null, adminToken);
  test("List employees (admin)", res.status, 200);
  const totalEmps = res.data?.pagination?.total || 0;
  console.log(`     → Found ${totalEmps} employees`);

  res = await request("GET", "/employees?department=Engineering", null, adminToken);
  test("Filter by department", res.status, 200);

  const firstEmpId = res.data?.data?.[0]?._id;
  if (firstEmpId) {
    res = await request("GET", `/employees/${firstEmpId}`, null, adminToken);
    test("Get single employee", res.status, 200);
  }

  res = await request("GET", "/employees", null, employeeToken);
  test("List employees (employee)", res.status, 200);

  // ── ATTENDANCE ──
  console.log("\n📌 Attendance Module");

  res = await request("GET", "/attendance/my?month=4&year=2026", null, employeeToken);
  test("Get my attendance", res.status, 200);
  console.log(`     → ${res.data?.data?.records?.length || 0} records this month`);

  res = await request("GET", "/attendance/all", null, adminToken);
  test("Get all attendance (admin)", res.status, 200);

  // ── LEAVES ──
  console.log("\n📌 Leaves Module");

  res = await request("GET", "/leaves/my", null, employeeToken);
  test("Get my leaves", res.status, 200);

  res = await request("GET", "/leaves/balance", null, employeeToken);
  test("Get leave balance", res.status, 200);

  res = await request("GET", "/leaves/all", null, adminToken);
  test("Get all leaves (admin)", res.status, 200);
  const pendingLeaves = res.data?.data?.filter((l) => l.status === "pending") || [];
  console.log(`     → ${pendingLeaves.length} pending leave(s)`);

  // ── SALARY ──
  console.log("\n📌 Salary Module");

  res = await request("GET", "/salary/my?year=2026", null, adminToken);
  test("Get salary (admin view)", res.status, 200);
  console.log(`     → ${res.data?.data?.length || 0} salary records in 2026`);

  res = await request("GET", "/salary/my?year=2026", null, employeeToken);
  test("Get salary (employee view)", res.status, 200);

  // ── DASHBOARD ──
  console.log("\n📌 Dashboard Module");

  res = await request("GET", "/dashboard/stats", null, adminToken);
  test("Admin dashboard stats", res.status, 200);
  if (res.data?.data?.overview) {
    const o = res.data.data.overview;
    console.log(`     → ${o.totalEmployees} employees, ${o.pendingLeaves} pending leaves`);
  }

  res = await request("GET", "/dashboard/employee", null, employeeToken);
  test("Employee dashboard", res.status, 200);

  // ── AUTHORIZATION ──
  console.log("\n📌 Authorization (negative tests)");

  res = await request("GET", "/employees", null, null);
  test("Unauthenticated request blocked", res.status, 401);

  res = await request("POST", "/employees", { name: "Test" }, employeeToken);
  test("Employee can't create employees", res.status, 403);

  res = await request("GET", "/dashboard/stats", null, employeeToken);
  test("Employee can't access admin dashboard", res.status, 403);

  // ── SUMMARY ──
  console.log("\n" + "═".repeat(50));
  const passed = testResults.filter((t) => t.pass).length;
  const failed = testResults.filter((t) => !t.pass).length;
  console.log(`\n🏁 Results: ${passed}/${testResults.length} passed, ${failed} failed`);

  if (failed > 0) {
    console.log("\n❌ Failed tests:");
    testResults.filter((t) => !t.pass).forEach((t) => console.log(`   - ${t.name}`));
  }
  console.log("");
}

run().catch(console.error);
