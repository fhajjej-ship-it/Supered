# Skill Design Principles

Supered skills are written as operating playbooks, not inspirational prompts. The description is only a trigger. The body carries the useful work: required inputs, a procedure, evidence expectations, guardrails, failure handling, and quality gates.

## Source Guidance

- OpenAI's skill guidance emphasizes concise, reusable task instructions that can be invoked when the model needs a specific capability: https://openai.com/academy/skills/
- OpenAI's practical agent guide frames agents as systems that need clear task boundaries, reliable handoffs, tool use, and verification loops: https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- Anthropic's Agent Skills guidance describes skills as modular capability folders with instructions and optional resources, loaded only when relevant: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Anthropic's agent-building guidance favors simple, composable workflows, clear routing, explicit evaluator patterns, and measured autonomy: https://www.anthropic.com/engineering/building-effective-agents
- OpenAI's prompt engineering best practices reinforce direct instructions, concrete examples, explicit constraints, and clear desired outputs: https://help.openai.com/en/articles/6654000-playground-and-prompt-engineering

## Supered Standards

Every bundled skill should meet these standards:

- Trigger-only metadata: the frontmatter description starts with `Use when`, stays short, and does not summarize the procedure.
- Progressive disclosure: the first page gives the operating path; deeper examples and resources are only included when they help the agent act.
- Evidence-first completion: each workflow names what proof must exist before the agent claims progress.
- Guardrails over vibes: each skill states hard stop conditions and behaviors that must not happen.
- Failure-mode literacy: common breakdowns are named with recovery moves.
- Concrete examples: scenarios show what good use looks like in real development work.
- Testable quality: repository tests enforce the structural minimum so the skills cannot drift back into thin paragraphs.

The goal is not more text for its own sake. The goal is a compact professional standard: when an agent opens a Supered skill, it should know when to use it, how to proceed, when to stop, what to show, and how to prove the result.
