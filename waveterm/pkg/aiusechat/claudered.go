package aiusechat

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/wavetermdev/waveterm/pkg/aiusechat/uctypes"
)

type ClaudeRedSkill struct {
	Name        string `json:"name"`
	Category    string `json:"category"`
	Path        string `json:"path"`
	Description string `json:"description"`
}

type ClaudeRedIndex struct {
	Skills []ClaudeRedSkill `json:"skills"`
}

var (
	claudeRedPath     string
	claudeRedPathOnce sync.Once
	claudeRedIndex    *ClaudeRedIndex
	claudeRedOnce     sync.Once
)

// findClaudeRedPath searches for the Claude-Red directory in common locations
func findClaudeRedPath() string {
	claudeRedPathOnce.Do(func() {
		// Try environment variable first if any
		if envPath := os.Getenv("CLAUDE_RED_PATH"); envPath != "" {
			if info, err := os.Stat(envPath); err == nil && info.IsDir() {
				claudeRedPath = envPath
				return
			}
		}

		// Try current directory or parent directories
		dir, err := os.Getwd()
		if err == nil {
			for {
				target := filepath.Join(dir, "Claude-Red")
				if info, err := os.Stat(target); err == nil && info.IsDir() {
					claudeRedPath = target
					return
				}
				// Stop at root or volume root
				parent := filepath.Dir(dir)
				if parent == dir {
					break
				}
				dir = parent
			}
		}

		// Default fallback to absolute dev path
		fallback := `c:\GitHub\SentinelAI_Desktop_Terminal\Claude-Red`
		if info, err := os.Stat(fallback); err == nil && info.IsDir() {
			claudeRedPath = fallback
			return
		}

		log.Printf("[Claude-Red] Warning: Claude-Red folder not found in working directory or fallbacks.")
	})
	return claudeRedPath
}

// loadClaudeRedIndex parses the claude-skills.json index
func loadClaudeRedIndex() *ClaudeRedIndex {
	claudeRedOnce.Do(func() {
		basePath := findClaudeRedPath()
		if basePath == "" {
			return
		}
		jsonPath := filepath.Join(basePath, "claude-skills.json")
		data, err := ioutil.ReadFile(jsonPath)
		if err != nil {
			log.Printf("[Claude-Red] Error reading claude-skills.json: %v", err)
			return
		}

		var index ClaudeRedIndex
		if err := json.Unmarshal(data, &index); err != nil {
			log.Printf("[Claude-Red] Error parsing claude-skills.json: %v", err)
			return
		}

		claudeRedIndex = &index
		log.Printf("[Claude-Red] Loaded %d security playbooks/skills successfully.", len(claudeRedIndex.Skills))
	})
	return claudeRedIndex
}

// matchSkills checks user message text for relevant security skill keywords
func matchSkills(userText string) []ClaudeRedSkill {
	index := loadClaudeRedIndex()
	if index == nil {
		return nil
	}

	userTextLower := strings.ToLower(userText)
	var matched []ClaudeRedSkill

	// Keyword mapping for specific skills to handle shorthand/common names
	customKeywords := map[string][]string{
		"offensive-sqli":             {"sqli", "sql injection", "sqlmap", "union-based", "boolean-based", "time-based", "blind sql"},
		"offensive-xss":              {"xss", "cross-site scripting", "cross site scripting", "dom-based xss", "stored xss", "reflected xss"},
		"offensive-ssrf":             {"ssrf", "server-side request forgery", "server side request forgery", "imds", "metadata endpoint"},
		"offensive-jwt":              {"jwt", "json web token", "alg:none", "hmac secret"},
		"offensive-oauth":            {"oauth", "oauth2", "redirect_uri", "authorization code"},
		"offensive-active-directory": {"active directory", "active-directory", "kerberoast", "asreproast", "dcsync", "adCS", "bloodhound"},
		"offensive-cloud":            {"cloud", "aws", "azure", "gcp", "privilege escalation", "pacu", "scoutsuite", "prowler"},
		"offensive-ssti":             {"ssti", "template injection", "jinja2", "mako", "twig"},
		"offensive-xxe":              {"xxe", "xml external entity"},
		"offensive-idor":             {"idor", "insecure direct object"},
		"offensive-file-upload":      {"file upload", "webshell", "rce upload"},
		"offensive-osint":            {"osint", "recon", "shodan", "censys", "subdomain"},
		"offensive-edr-evasion":      {"edr", "evasion", "av bypass", "antivirus", "hooking", "syscalls"},
		"offensive-fuzzing":          {"fuzzing", "fuzzer", "afl++", "libfuzzer", "honggfuzz"},
		"offensive-exploit-dev":      {"exploit development", "exploit-dev", "buffer overflow", "shellcode", "rop chain"},
		"offensive-iot":              {"iot", "jtag", "uart", "firmware", "embedded"},
		"offensive-mobile":           {"mobile", "android", "ios", "frida", "objection", "apktool"},
		"offensive-wifi":             {"wifi", "wireless", "wpa", "wep", "deauth", "evil twin"},
	}

	for _, skill := range index.Skills {
		matchedSkill := false

		// Check name and category
		skillNameLower := strings.ToLower(skill.Name)
		skillCatLower := strings.ToLower(skill.Category)

		// 1. Direct match on name or category
		if strings.Contains(userTextLower, skillNameLower) || strings.Contains(userTextLower, skillCatLower) {
			matchedSkill = true
		}

		// 2. Custom keyword checks
		if !matchedSkill {
			if keywords, ok := customKeywords[skill.Name]; ok {
				for _, kw := range keywords {
					if strings.Contains(userTextLower, kw) {
						matchedSkill = true
						break
					}
				}
			}
		}

		// 3. Fallback name tokens check (excluding "offensive-")
		if !matchedSkill {
			cleanName := strings.Replace(skillNameLower, "offensive-", "", 1)
			tokens := strings.Split(cleanName, "-")
			allTokensMatch := true
			for _, t := range tokens {
				if len(t) > 2 && !strings.Contains(userTextLower, t) {
					allTokensMatch = false
					break
				}
			}
			if allTokensMatch && len(tokens) > 0 {
				matchedSkill = true
			}
		}

		if matchedSkill {
			matched = append(matched, skill)
		}
	}

	return matched
}

// AppendClaudeRedSkills checks the user message and appends matched skills to system prompts
func AppendClaudeRedSkills(systemPrompt []string, msg uctypes.AIMessage) []string {
	// Extract text from user message
	var userText strings.Builder
	for _, part := range msg.Parts {
		if part.Type == uctypes.AIMessagePartTypeText {
			userText.WriteString(part.Text)
			userText.WriteString(" ")
		}
	}

	text := strings.TrimSpace(userText.String())
	if text == "" {
		return systemPrompt
	}

	matched := matchSkills(text)
	if len(matched) == 0 {
		return systemPrompt
	}

	basePath := findClaudeRedPath()
	if basePath == "" {
		return systemPrompt
	}

	// Limit to max 3 matched skills to avoid hitting token limits
	if len(matched) > 3 {
		matched = matched[:3]
	}

	log.Printf("[Claude-Red] Matched %d security playbooks for prompt context", len(matched))

	for _, skill := range matched {
		skillFile := filepath.Join(basePath, filepath.FromSlash(skill.Path))
		data, err := ioutil.ReadFile(skillFile)
		if err != nil {
			log.Printf("[Claude-Red] Error reading skill file %s: %v", skillFile, err)
			continue
		}

		// Append the SKILL.md contents directly as system instructions
		instructionBlock := fmt.Sprintf("\n\n## CLAUDE-RED SECURITY PLAYBOOK: %s\n\n%s\n", strings.ToUpper(skill.Name), string(data))
		systemPrompt = append(systemPrompt, instructionBlock)
	}

	return systemPrompt
}
