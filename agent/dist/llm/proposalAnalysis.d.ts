import { ProposalAnalysis } from "../types/Proposal";
/**
 * Simple mock LLM implementation for testing
 * This analyzes a DAO proposal and returns structured analysis
 *
 * For testing: Returns a mock response based on proposal text
 * TODO: Integrate with real LLM (OpenAI, Anthropic, etc.) and add RAG retrieval
 */
export declare function callLLMForProposalAnalysis(daoId: string, proposalId: string, proposalText: string): Promise<ProposalAnalysis>;
/**
 * TODO: Production implementation with real LLM
 *
 * async function callLLMForProposalAnalysisWithRAG(...) {
 *   // 1. Embed proposal text
 *   const embedding = await embedText(proposalText);
 *
 *   // 2. Retrieve relevant context from vector store
 *   const context = await retriever.retrieve(daoId, embedding);
 *
 *   // 3. Build prompt with DAO config + context + proposal
 *   const prompt = buildAnalysisPrompt(daoId, proposalText, context);
 *
 *   // 4. Call LLM (OpenAI/Anthropic/etc)
 *   const response = await llm.generate(prompt);
 *
 *   // 5. Parse and return structured analysis
 *   return parseAnalysisResponse(response);
 * }
 */
//# sourceMappingURL=proposalAnalysis.d.ts.map