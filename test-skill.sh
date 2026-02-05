#!/bin/bash
set -e

# Test a skill using RED-GREEN-REFACTOR methodology
# Usage: ./test-skill.sh <path-to-skill-directory>

SKILL_DIR="${1:-.}"
SKILL_NAME=$(basename "$SKILL_DIR")
TESTS_DIR="$SKILL_DIR/tests"
SCENARIOS_FILE="$TESTS_DIR/scenarios.yml"
BASELINE_FILE="$TESTS_DIR/baseline.md"
WITH_SKILL_FILE="$TESTS_DIR/with-skill.md"
RATIONALIZATIONS_FILE="$TESTS_DIR/rationalizations.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Testing Skill: $SKILL_NAME"
echo "========================================="

# Check if scenarios exist
if [ ! -f "$SCENARIOS_FILE" ]; then
    echo -e "${RED}❌ No scenarios.yml found in $TESTS_DIR${NC}"
    echo "Create scenarios.yml first with test cases"
    exit 1
fi

# Check if yq is installed
if ! command -v yq &> /dev/null; then
    echo -e "${YELLOW}⚠️  yq not found. Install with: brew install yq${NC}"
    exit 1
fi

# Get scenario count
SCENARIO_COUNT=$(yq '.scenarios | length' "$SCENARIOS_FILE")
echo -e "\nFound $SCENARIO_COUNT test scenarios"

# Prompt for test phase
echo ""
echo "Select test phase:"
echo "1) RED - Baseline (without skill)"
echo "2) GREEN - With skill"
echo "3) BOTH - Run complete RED-GREEN cycle"
read -p "Choice (1/2/3): " PHASE

run_baseline() {
    echo -e "\n${YELLOW}=== RED PHASE: Testing WITHOUT skill ===${NC}\n"

    # Create or clear baseline file
    echo "# Baseline Behavior (WITHOUT skill)" > "$BASELINE_FILE"
    echo "" >> "$BASELINE_FILE"
    echo "Generated: $(date)" >> "$BASELINE_FILE"
    echo "" >> "$BASELINE_FILE"

    # Initialize rationalizations file
    echo "# Observed Rationalizations" > "$RATIONALIZATIONS_FILE"
    echo "" >> "$RATIONALIZATIONS_FILE"
    echo "Generated: $(date)" >> "$RATIONALIZATIONS_FILE"
    echo "" >> "$RATIONALIZATIONS_FILE"

    for i in $(seq 0 $((SCENARIO_COUNT - 1))); do
        scenario_name=$(yq ".scenarios[$i].name" "$SCENARIOS_FILE")
        echo -e "${YELLOW}Testing scenario: $scenario_name${NC}"

        echo "## Scenario: $scenario_name" >> "$BASELINE_FILE"
        echo "" >> "$BASELINE_FILE"

        # Extract scenario details
        setup=$(yq ".scenarios[$i].setup" "$SCENARIOS_FILE")

        echo "### Setup" >> "$BASELINE_FILE"
        echo '```' >> "$BASELINE_FILE"
        echo "$setup" >> "$BASELINE_FILE"
        echo '```' >> "$BASELINE_FILE"
        echo "" >> "$BASELINE_FILE"

        echo "### Expected behaviors (without skill)" >> "$BASELINE_FILE"
        yq ".scenarios[$i].expected_without_skill.behaviors[]" "$SCENARIOS_FILE" | while read -r behavior; do
            echo "- $behavior" >> "$BASELINE_FILE"
        done
        echo "" >> "$BASELINE_FILE"

        echo "### Expected rationalizations" >> "$BASELINE_FILE"
        yq ".scenarios[$i].expected_without_skill.rationalizations[]" "$SCENARIOS_FILE" | while read -r rationalization; do
            echo "- $rationalization" >> "$BASELINE_FILE"
        done
        echo "" >> "$BASELINE_FILE"

        echo "### Actual observed behavior" >> "$BASELINE_FILE"
        echo "TODO: Run subagent and document actual behavior here" >> "$BASELINE_FILE"
        echo "" >> "$BASELINE_FILE"

        echo "---" >> "$BASELINE_FILE"
        echo "" >> "$BASELINE_FILE"
    done

    echo -e "\n${GREEN}✓ Baseline template created: $BASELINE_FILE${NC}"
    echo -e "${YELLOW}⚠️  ACTION REQUIRED: Run scenarios manually with subagents and fill in 'Actual observed behavior'${NC}"
}

run_with_skill() {
    echo -e "\n${GREEN}=== GREEN PHASE: Testing WITH skill ===${NC}\n"

    # Create or clear with-skill file
    echo "# Behavior WITH skill" > "$WITH_SKILL_FILE"
    echo "" >> "$WITH_SKILL_FILE"
    echo "Generated: $(date)" >> "$WITH_SKILL_FILE"
    echo "" >> "$WITH_SKILL_FILE"

    for i in $(seq 0 $((SCENARIO_COUNT - 1))); do
        scenario_name=$(yq ".scenarios[$i].name" "$SCENARIOS_FILE")
        echo -e "${GREEN}Testing scenario with skill: $scenario_name${NC}"

        echo "## Scenario: $scenario_name" >> "$WITH_SKILL_FILE"
        echo "" >> "$WITH_SKILL_FILE"

        # Extract scenario details
        setup=$(yq ".scenarios[$i].setup" "$SCENARIOS_FILE")

        echo "### Setup" >> "$WITH_SKILL_FILE"
        echo '```' >> "$WITH_SKILL_FILE"
        echo "$setup" >> "$WITH_SKILL_FILE"
        echo '```' >> "$WITH_SKILL_FILE"
        echo "" >> "$WITH_SKILL_FILE"

        echo "### Expected behaviors (with skill)" >> "$WITH_SKILL_FILE"
        yq ".scenarios[$i].expected_with_skill.behaviors[]" "$SCENARIOS_FILE" | while read -r behavior; do
            echo "- $behavior" >> "$WITH_SKILL_FILE"
        done
        echo "" >> "$WITH_SKILL_FILE"

        echo "### Success criteria" >> "$WITH_SKILL_FILE"
        yq ".scenarios[$i].expected_with_skill.success_criteria[]" "$SCENARIOS_FILE" | while read -r criteria; do
            echo "- $criteria" >> "$WITH_SKILL_FILE"
        done
        echo "" >> "$WITH_SKILL_FILE"

        echo "### Actual observed behavior" >> "$WITH_SKILL_FILE"
        echo "TODO: Run subagent WITH skill loaded and document actual behavior here" >> "$WITH_SKILL_FILE"
        echo "" >> "$WITH_SKILL_FILE"

        echo "### Result" >> "$WITH_SKILL_FILE"
        echo "- [ ] PASS - Meets all success criteria" >> "$WITH_SKILL_FILE"
        echo "- [ ] FAIL - Document which criteria failed" >> "$WITH_SKILL_FILE"
        echo "" >> "$WITH_SKILL_FILE"

        echo "---" >> "$WITH_SKILL_FILE"
        echo "" >> "$WITH_SKILL_FILE"
    done

    echo -e "\n${GREEN}✓ With-skill template created: $WITH_SKILL_FILE${NC}"
    echo -e "${YELLOW}⚠️  ACTION REQUIRED: Run scenarios manually with subagents (WITH skill) and fill in 'Actual observed behavior'${NC}"
}

# Run selected phase
case $PHASE in
    1)
        run_baseline
        ;;
    2)
        run_with_skill
        ;;
    3)
        run_baseline
        run_with_skill
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "Next steps:"
echo "========================================="
echo "1. Review generated files in $TESTS_DIR/"
echo "2. Run scenarios using Task tool with subagents"
echo "3. Document observed behaviors in baseline.md and with-skill.md"
echo "4. Extract rationalizations to rationalizations.md"
echo "5. Update skill based on findings"
echo "6. Re-run GREEN phase to verify"
echo ""
