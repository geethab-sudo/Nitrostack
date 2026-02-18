# Insurance Tools Test Prompts

This document contains comprehensive test prompts to validate all insurance tools functionality.

## Table of Contents
1. [List Insurance Tool](#list-insurance-tool)
2. [Suggest Insurance Plan Tool](#suggest-insurance-plan-tool)
3. [Book Insurance With User Tool](#book-insurance-with-user-tool)
4. [List Booking Status By Email Tool](#list-booking-status-by-email-tool)
5. [Integration Test Scenarios](#integration-test-scenarios)
6. [Edge Cases and Error Scenarios](#edge-cases-and-error-scenarios)

---

## List Insurance Tool

### Basic Queries

1. **Simple salary-based query**
   ```
   Show me insurance plans for someone with an annual salary of 500000
   ```

2. **With family members**
   ```
   I need insurance for a family of 4. My salary is 600000 per year. What options do I have?
   ```

3. **With age filter**
   ```
   I'm 35 years old and earn 400000 annually. What insurance plans are available for me?
   ```

4. **Complete profile query**
   ```
   Find insurance plans for a 42-year-old person with a salary of 750000 supporting a family of 3
   ```

5. **Pagination test**
   ```
   Show me the first 10 insurance plans for someone earning 500000 per year
   ```

6. **Skip and limit**
   ```
   Show me insurance plans 11-20 for a person with salary 500000
   ```

### Advanced Filtering

7. **Custom filter - specific type**
   ```
   List health insurance plans for someone with salary 500000
   ```

8. **Custom filter - premium range**
   ```
   Show me insurance plans where premium is less than 30000 for someone earning 500000
   ```

9. **Custom filter - coverage amount**
   ```
   Find insurance plans with coverage greater than 1000000 for salary 600000
   ```

10. **Multiple filters combined**
    ```
    I need family health insurance plans with premium under 40000 for a salary of 800000
    ```

### Edge Cases

11. **Low salary**
    ```
    What insurance plans are available for someone earning only 100000 per year?
    ```

12. **High salary**
    ```
    Show me all insurance options for someone with an annual salary of 2000000
    ```

13. **Single person (familyMembers = 1)**
    ```
    I'm single and earn 450000. What individual insurance plans can I get?
    ```

14. **Large family**
    ```
    I have a family of 6 and earn 900000. What family insurance plans cover us?
    ```

15. **Young age**
    ```
    I'm 22 years old with salary 300000. What insurance plans am I eligible for?
    ```

16. **Senior age**
    ```
    I'm 65 years old and earn 600000. What insurance plans are available for seniors?
    ```

---

## Suggest Insurance Plan Tool

### Basic Suggestions

17. **Simple profile**
    ```
    I'm 30 years old, earn 500000 per year, and have a family of 2. Suggest insurance plans for me.
    ```

18. **With health conditions**
    ```
    I'm 40, earn 600000, have a family of 3, and I have diabetes and hypertension. What insurance plans do you recommend?
    ```

19. **Family-focused**
    ```
    Suggest the best insurance plans for a family of 5 with an annual income of 800000. I'm 38 years old.
    ```

20. **Health insurance specific**
    ```
    I need health insurance. I'm 35, earn 500000, have 2 family members, and have asthma. What do you suggest?
    ```

21. **Life insurance specific**
    ```
    I'm looking for life insurance. I'm 45 years old, earn 700000, and have a family of 4.
    ```

22. **Travel insurance**
    ```
    I need travel insurance. I'm 28, earn 400000, and travel frequently for work.
    ```

23. **Motor insurance**
    ```
    Suggest motor insurance plans for me. I'm 32, earn 550000, and have one family member.
    ```

### Complex Scenarios

24. **Multiple health conditions**
    ```
    I have diabetes, hypertension, and heart disease. I'm 50, earn 700000, family of 2. What insurance should I get?
    ```

25. **Young professional**
    ```
    I'm a 25-year-old software engineer earning 800000. I'm single and healthy. What insurance plans make sense for me?
    ```

26. **Senior with conditions**
    ```
    I'm 60 years old, earn 600000, have a spouse, and have arthritis and high blood pressure. Suggest insurance plans.
    ```

27. **Large family with conditions**
    ```
    I'm 42, earn 1000000, have a family of 6 including my parents, and my wife has diabetes. What insurance plans cover us?
    ```

28. **Affordability focus**
    ```
    I'm 35, earn 400000, have a family of 3. I need affordable insurance that covers pre-existing conditions.
    ```

29. **Comprehensive coverage**
    ```
    I want comprehensive health insurance. I'm 38, earn 750000, family of 4, and have no health issues currently.
    ```

### Edge Cases

30. **Very young**
    ```
    I'm 18 years old, earn 200000, single. What insurance plans are suitable for me?
    ```

31. **Very old**
    ```
    I'm 75 years old, earn 500000, have a spouse. What insurance options do I have?
    ```

32. **Low income with conditions**
    ```
    I'm 40, earn 250000, have 2 kids, and have diabetes. What affordable insurance can I get?
    ```

33. **High income, no conditions**
    ```
    I'm 35, earn 1500000, have a family of 3, and we're all healthy. Suggest the best insurance plans.
    ```

34. **Single parent**
    ```
    I'm a single parent, 36 years old, earn 500000, have 2 children. What insurance plans work for us?
    ```

---

## Book Insurance With User Tool

### Basic Bookings

35. **Simple booking**
    ```
    I want to book policy POL-HDFC-HEA-0002. My name is John Doe, email is john.doe@example.com, and phone is +91-9876543210.
    ```

36. **Booking with payment**
    ```
    Book policy POL-ICICI-LIF-0001 for me. I'm Sarah Smith, email sarah.smith@example.com, phone +91-9876543211. I'll pay by credit card.
    ```

37. **Booking with dates**
    ```
    I want to book policy POL-SBI-HEA-0003 starting from 2024-01-01 for 1 year. My details: Name: Raj Kumar, Email: raj.kumar@example.com, Phone: +91-9876543212
    ```

38. **Booking with transaction ID**
    ```
    Book policy POL-AXIS-MOT-0005. I've already paid. Transaction ID: TXN123456789. My email is mike.jones@example.com, name is Mike Jones, phone +91-9876543213.
    ```

39. **Multi-year booking**
    ```
    I want to book policy POL-HDFC-HEA-0002 for 3 years starting from 2024-06-01. Email: priya.sharma@example.com, Name: Priya Sharma, Phone: +91-9876543214
    ```

40. **Booking with notes**
    ```
    Book policy POL-ICICI-LIF-0001 for me. I need it for my family. Email: amit.patel@example.com, Name: Amit Patel, Phone: +91-9876543215. Note: Please ensure family coverage is included.
    ```

### Payment Methods

41. **UPI payment**
    ```
    Book policy POL-SBI-HEA-0003. Payment method: UPI. Email: neha.gupta@example.com, Name: Neha Gupta, Phone: +91-9876543216
    ```

42. **Debit card**
    ```
    I want to book policy POL-AXIS-MOT-0005 using debit card. Email: vikram.singh@example.com, Name: Vikram Singh, Phone: +91-9876543217
    ```

43. **Bank transfer**
    ```
    Book policy POL-HDFC-HEA-0002. I'll pay via bank transfer. Email: anita.verma@example.com, Name: Anita Verma, Phone: +91-9876543218
    ```

### Long-term Bookings

44. **5-year booking**
    ```
    Book policy POL-ICICI-LIF-0001 for 5 years starting 2024-01-01. Email: rohit.malhotra@example.com, Name: Rohit Malhotra, Phone: +91-9876543219
    ```

45. **10-year booking**
    ```
    I want to book policy POL-SBI-HEA-0003 for 10 years from 2024-06-01. Email: kavita.reddy@example.com, Name: Kavita Reddy, Phone: +91-9876543220
    ```

### Edge Cases

46. **Booking without email (should prompt)**
    ```
    I want to book policy POL-HDFC-HEA-0002. My name is Test User and phone is +91-9876543221.
    ```

47. **Invalid policy number**
    ```
    Book policy INVALID-POLICY-123 for me. Email: test@example.com, Name: Test User, Phone: +91-9876543222
    ```

48. **Existing user update**
    ```
    Book policy POL-ICICI-LIF-0001. I'm an existing user. Email: john.doe@example.com, Name: John Doe Updated, Phone: +91-9876543223
    ```

---

## List Booking Status By Email Tool

### Basic Queries

49. **Check my bookings**
    ```
    Show me all my insurance bookings. My email is john.doe@example.com
    ```

50. **Booking status check**
    ```
    What's the status of my insurance bookings? Email: sarah.smith@example.com
    ```

51. **Recent bookings**
    ```
    Show me my recent insurance bookings. Email: raj.kumar@example.com
    ```

52. **All bookings for user**
    ```
    List all insurance bookings for email mike.jones@example.com
    ```

### Edge Cases

53. **User with no bookings**
    ```
    Check bookings for email newuser@example.com
    ```

54. **User with multiple bookings**
    ```
    Show me all bookings for email frequent.buyer@example.com
    ```

55. **Invalid email format**
    ```
    Show bookings for email invalid-email-format
    ```

56. **Non-existent user**
    ```
    List bookings for email nonexistent@example.com
    ```

---

## Integration Test Scenarios

### Complete User Journey

57. **Full workflow - discovery to booking**
    ```
    I'm 35 years old, earn 500000 per year, have a family of 3, and have diabetes. Help me find and book the best health insurance plan.
    ```

58. **Browse, suggest, and book**
    ```
    I need insurance. I'm 40, earn 600000, family of 4. First show me what's available, then suggest the best ones, and help me book one.
    ```

59. **Compare and book**
    ```
    I want to compare insurance plans for a 30-year-old earning 450000 with a family of 2, then book the most suitable one.
    ```

60. **Check status after booking**
    ```
    I just booked an insurance plan. My email is test@example.com. Can you show me the booking status?
    ```

### Multi-step Interactions

61. **List → Suggest → Book**
    ```
    Step 1: List insurance plans for salary 500000, family of 3, age 35
    Step 2: Suggest the best plans for this profile with diabetes
    Step 3: Book the top suggested plan with my details: email user@example.com, name User Name, phone +91-9876543224
    ```

62. **Book → Check Status**
    ```
    Book policy POL-HDFC-HEA-0002 for email booking.test@example.com, name Booking Test, phone +91-9876543225. Then show me the booking status.
    ```

63. **Multiple bookings for same user**
    ```
    Book policy POL-ICICI-LIF-0001 for email multi.booking@example.com, name Multi User, phone +91-9876543226. Then book policy POL-SBI-HEA-0003 for the same user. Then show all bookings.
    ```

---

## Edge Cases and Error Scenarios

### Invalid Inputs

64. **Negative salary**
    ```
    Show insurance plans for salary -100000
    ```

65. **Zero salary**
    ```
    List insurance for salary 0
    ```

66. **Invalid age (too high)**
    ```
    Suggest insurance for age 150, salary 500000, family of 2
    ```

67. **Negative age**
    ```
    I'm -5 years old, earn 500000. What insurance can I get?
    ```

68. **Invalid email format**
    ```
    Book policy POL-HDFC-HEA-0002. Email: not-an-email, Name: Test, Phone: +91-9876543227
    ```

69. **Missing required fields**
    ```
    Book policy POL-HDFC-HEA-0002. My name is Test User.
    ```

70. **Invalid date format**
    ```
    Book policy POL-HDFC-HEA-0002 for 1 year starting invalid-date. Email: test@example.com, Name: Test, Phone: +91-9876543228
    ```

71. **Years without start date**
    ```
    Book policy POL-HDFC-HEA-0002 for 2 years. Email: test@example.com, Name: Test, Phone: +91-9876543229
    ```

### Boundary Conditions

72. **Minimum salary threshold**
    ```
    What insurance plans are available for salary 1?
    ```

73. **Maximum age**
    ```
    Suggest insurance for age 120, salary 500000, family of 1
    ```

74. **Zero family members**
    ```
    I have 0 family members, earn 500000, age 35. What insurance plans are available?
    ```

75. **Very large family**
    ```
    I have 20 family members, earn 1000000, age 40. What insurance covers us all?
    ```

76. **Maximum years for booking**
    ```
    Book policy POL-HDFC-HEA-0002 for 50 years starting 2024-01-01. Email: test@example.com, Name: Test, Phone: +91-9876543230
    ```

77. **Over maximum years**
    ```
    Book policy POL-HDFC-HEA-0002 for 100 years. Email: test@example.com, Name: Test, Phone: +91-9876543231
    ```

### Data Validation

78. **Empty string inputs**
    ```
    Book policy POL-HDFC-HEA-0002. Email: test@example.com, Name: "", Phone: +91-9876543232
    ```

79. **Special characters in name**
    ```
    Book policy POL-HDFC-HEA-0002. Email: test@example.com, Name: John O'Brien-Smith, Phone: +91-9876543233
    ```

80. **Unicode characters**
    ```
    Book policy POL-HDFC-HEA-0002. Email: test@example.com, Name: राम कुमार, Phone: +91-9876543234
    ```

### Performance Tests

81. **Large result set**
    ```
    Show me all insurance plans for salary 2000000 with no other filters
    ```

82. **Complex filter query**
    ```
    List insurance plans for salary 500000, family of 4, age 35, with custom filters for type Health, premium < 50000, coverage > 500000
    ```

83. **Multiple rapid requests**
    ```
    Make 10 consecutive requests to list insurance for salary 500000
    ```

### Cache Testing

84. **Cache hit test**
    ```
    Suggest insurance for age 35, salary 500000, family of 3, deficiencies ["diabetes"]. Then immediately suggest again with the same parameters.
    ```

85. **Cache miss test**
    ```
    Suggest insurance for age 35, salary 500000, family of 3. Then suggest for age 36, salary 500000, family of 3.
    ```

---

## Real-World Scenarios

### Scenario 1: Young Professional

86. **Complete scenario**
    ```
    I'm a 28-year-old software developer earning 700000 per year. I'm single and healthy. I want to:
    1. See what insurance plans are available
    2. Get personalized suggestions
    3. Book a suitable plan
    ```

### Scenario 2: Family with Health Issues

87. **Complete scenario**
    ```
    I'm 45, earn 800000, have a family of 4 (wife and 2 kids). My wife has diabetes and I have hypertension. Help me:
    1. Find family health insurance plans
    2. Get suggestions that cover our conditions
    3. Book the best option
    4. Check the booking status
    ```

### Scenario 3: Senior Citizen

88. **Complete scenario**
    ```
    I'm 68 years old, earn 600000, have a spouse. We both have some health issues. What insurance options do we have? Can you suggest and help me book?
    ```

### Scenario 4: Multiple Insurance Types

89. **Complete scenario**
    ```
    I need multiple types of insurance:
    1. Health insurance for my family (age 38, salary 750000, family of 4)
    2. Life insurance for myself
    3. Motor insurance for my car
    Help me find and book all three.
    ```

### Scenario 5: Budget-Conscious User

90. **Complete scenario**
    ```
    I'm 32, earn 350000, have a family of 3. I need affordable insurance that covers pre-existing conditions. Show me options, suggest the best, and help me book within my budget.
    ```

---

## Summary

These test prompts cover:
- ✅ All 4 insurance tools (list, suggest, book, check status)
- ✅ Basic functionality and edge cases
- ✅ Error handling and validation
- ✅ Integration scenarios
- ✅ Real-world use cases
- ✅ Performance and caching
- ✅ Boundary conditions

Use these prompts to thoroughly test the insurance tools system and ensure all functionality works as expected.
