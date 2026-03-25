#!/bin/bash
# TeenUp LMS — API Demo Script
# Run: chmod +x api-demo.sh && ./api-demo.sh
# Requires: curl, running backend on localhost:3001

BASE="http://localhost:3001/api"

echo "========================================="
echo "  TeenUp LMS — API Demo"
echo "========================================="
echo ""

# 1. Create Parent
echo "📌 1. Create Parent"
curl -s -X POST "$BASE/parents" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van A","phone":"0909123456","email":"nguyenvana@gmail.com"}' | python3 -m json.tool
echo ""

# 2. Get Parent
echo "📌 2. Get Parent #1"
curl -s "$BASE/parents/1" | python3 -m json.tool
echo ""

# 3. Create Student
echo "📌 3. Create Student"
curl -s -X POST "$BASE/students" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van C","dob":"2015-03-15","gender":"male","current_grade":"5","parentId":1}' | python3 -m json.tool
echo ""

# 4. Get Student (with parent info)
echo "📌 4. Get Student #1 (includes parent)"
curl -s "$BASE/students/1" | python3 -m json.tool
echo ""

# 5. Create Class
echo "📌 5. Create Class"
curl -s -X POST "$BASE/classes" \
  -H "Content-Type: application/json" \
  -d '{"name":"Toan Nang Cao","subject":"Math","day_of_week":"Monday","time_slot":"08:00-09:30","teacher_name":"Thay Minh","max_students":5}' | python3 -m json.tool
echo ""

# 6. List Classes by Day
echo "📌 6. List Classes on Monday"
curl -s "$BASE/classes?day=Monday" | python3 -m json.tool
echo ""

# 7. Create Subscription
echo "📌 7. Create Subscription"
curl -s -X POST "$BASE/subscriptions" \
  -H "Content-Type: application/json" \
  -d "{\"studentId\":1,\"package_name\":\"Goi Hoc 3 Thang\",\"start_date\":\"$(date +%Y-%m-%d)\",\"end_date\":\"$(date -v+3m +%Y-%m-%d 2>/dev/null || date -d '+3 months' +%Y-%m-%d)\",\"total_sessions\":10}" | python3 -m json.tool
echo ""

# 8. Register Student to Class
echo "📌 8. Register Student #1 to Class #1"
curl -s -X POST "$BASE/classes/1/register" \
  -H "Content-Type: application/json" \
  -d '{"studentId":1}' | python3 -m json.tool
echo ""

# 9. Get Subscription Status
echo "📌 9. Get Subscription #1 (check used_sessions)"
curl -s "$BASE/subscriptions/1" | python3 -m json.tool
echo ""

# 10. Cancel Registration (test refund)
echo "📌 10. Cancel Registration #1"
curl -s -X DELETE "$BASE/registrations/1" | python3 -m json.tool
echo ""

# 11. Verify Subscription After Cancel
echo "📌 11. Verify Subscription After Cancel"
curl -s "$BASE/subscriptions/1" | python3 -m json.tool
echo ""

echo "========================================="
echo "  Demo Complete!"
echo "========================================="
