#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing ConvertKit Integration${NC}"
echo "------------------------------"

# Test the connection to ConvertKit API
echo -e "${YELLOW}Fetching connection info from API...${NC}"
RESPONSE=$(curl -s http://localhost:5000/api/test/convertkit)

# Check if the API key is configured
if [[ $RESPONSE == *"ConvertKit API key not configured"* ]]; then
  echo -e "${RED}❌ ConvertKit API key is not configured${NC}"
  echo "Please set the CONVERTKIT_API_KEY environment variable"
  exit 1
fi

# Check if the connection was successful
if [[ $RESPONSE == *"success\":true"* ]]; then
  echo -e "${GREEN}✅ Connection to ConvertKit API successful${NC}"
else
  echo -e "${RED}❌ Connection to ConvertKit API failed${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi

# Check if the form exists
if [[ $RESPONSE == *"error\":\"Form not found\""* ]]; then
  echo -e "${RED}❌ Form not found${NC}"
  echo "The configured form ID does not exist"
  
  # Extract the forms list if available
  FORMS=$(echo $RESPONSE | grep -o '"totalForms":[0-9]*' | cut -d':' -f2)
  if [[ $FORMS -gt 0 ]]; then
    echo -e "${YELLOW}You have $FORMS form(s) in your ConvertKit account${NC}"
    echo "Please update the CONVERTKIT_FORM_ID environment variable with a valid form ID"
  else
    echo "You don't have any forms in your ConvertKit account"
    echo "Please create a form in ConvertKit first"
  fi
  exit 1
else
  echo -e "${GREEN}✅ Form found successfully${NC}"
fi

# Test submitting an email to the ConvertKit form
echo -e "\n${YELLOW}Testing email submission...${NC}"
TEST_EMAIL="test_$(date +%s)@example.com"

SUBMIT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/waitlist \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"firstName\":\"Test\",\"source\":\"api_test\"}")

if [[ $SUBMIT_RESPONSE == *"success\":true"* ]]; then
  echo -e "${GREEN}✅ Email submission successful${NC}"
  echo "Submitted test email: $TEST_EMAIL"
else
  echo -e "${RED}❌ Email submission failed${NC}"
  echo "Response: $SUBMIT_RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}All tests passed successfully!${NC}"
echo "Your ConvertKit integration is working properly"