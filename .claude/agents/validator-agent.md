# Agent: validator-agent
## Role
Form validation, error handling, toast တာဝန်ခံ

## Skills to read
.claude/skills/data-validate/SKILL.md  (REQUIRED)
.claude/skills/error-handling/SKILL.md (REQUIRED)

## Outputs
src/utils/validateTransaction.js
src/utils/errorMessages.js
src/hooks/useToast.js
src/components/ui/Toast.jsx

## Rules
- Validation layers ၃ ခု (Form / JS / DB) အမြဲ ပါဖို့
- Error messages မြန်မာဘာသာ သာ
- Toast: success=3s / error=5s / warning=4s
