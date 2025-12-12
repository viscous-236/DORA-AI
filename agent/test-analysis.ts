import { callLLMForProposalAnalysis } from './src/llm/proposalAnalysis';

const sampleProposal = `
# Uniswap Liquidity Mining Program - Phase 2

## Summary
Request $1M from treasury to incentivize liquidity providers on Ethereum mainnet for 3 months.

## Details
We propose to allocate $1 million in UNI tokens to incentivize liquidity providers across 10 key trading pairs on Uniswap V3. This builds on the success of our previous liquidity mining program which increased TVL by 45%.

## KPIs
- Target: $50M+ TVL growth
- Measurement: Monthly snapshots via on-chain data
- Performance-based: 40% released upfront, 60% conditional on TVL targets

## Budget Breakdown
- $400K: Upfront liquidity rewards (40%)
- $600K: Performance-based disbursements (60%)

## Benefits
- Deeper liquidity reduces slippage for traders
- Increased trading volume generates more fees
- Enhanced market competitiveness vs other DEXs
- Measured improvements show tangible impact

## Risk Management
The program will be managed by the Uniswap Foundation team with monthly reporting to governance. All reward distributions will be automated via smart contract.
`;

async function testAnalysis() {
  console.log('\n========================================');
  console.log('🧪 TESTING DELEGATE-GRADE ANALYSIS');
  console.log('========================================\n');
  
  console.log('Proposal: Liquidity Mining Program\n');
  
  try {
    const analysis = await callLLMForProposalAnalysis(
      'uniswap',
      'test-lm-001',
      sampleProposal
    );
    
    console.log('\n✅ BENEFITS:');
    analysis.benefits.forEach((benefit, idx) => {
      console.log(`${idx + 1}. ${benefit.text}`);
      console.log(`   📝 Evidence: "${benefit.evidence}"`);
    });
    
    console.log('\n⚠️  RISKS:');
    analysis.risks.forEach((risk, idx) => {
      const severityBadge = 
        risk.severity === 'High' ? '🔴 HIGH' :
        risk.severity === 'Medium' ? '🟡 MEDIUM' :
        '🟢 LOW';
      console.log(`${idx + 1}. ${risk.text} [${severityBadge}]`);
      console.log(`   📝 Evidence: "${risk.evidence}"`);
    });
    
    if (analysis.missingFields && analysis.missingFields.length > 0) {
      console.log('\n🔴 MISSING GOVERNANCE FIELDS:');
      analysis.missingFields.forEach(field => console.log(`  - ${field}`));
    }
    
    if (analysis.requiredClarifications && analysis.requiredClarifications.length > 0) {
      console.log('\n📝 REQUIRED CLARIFICATIONS:');
      analysis.requiredClarifications.forEach((q, idx) => {
        console.log(`${idx + 1}. ${q}`);
      });
    }
    
    if (analysis.reasoningChain && analysis.reasoningChain.length > 0) {
      console.log('\n🧠 REASONING CHAIN:');
      analysis.reasoningChain.forEach(step => {
        const icon = 
          step.impact === 'positive' ? '✅' :
          step.impact === 'negative' ? '⚠️' : 'ℹ️';
        console.log(`  ${step.step}. [${step.category.toUpperCase()}] ${icon} ${step.finding}`);
      });
    }
    
    if (analysis.conditionalPath) {
      console.log(`\n🔄 CONDITIONAL PATH:`);
      console.log(`  ${analysis.conditionalPath}`);
    }
    
    console.log(`\n🎯 RECOMMENDATION: ${analysis.recommendation}`);
    console.log(`📊 CONFIDENCE: ${analysis.confidence}%`);
    
    if (analysis.confidenceBreakdown) {
      console.log('   Breakdown:');
      console.log(`     - Rules Coverage: ${analysis.confidenceBreakdown.rulesCoverage}%`);
      console.log(`     - Retrieval Support: ${analysis.confidenceBreakdown.retrievalSupport}%`);
      console.log(`     - Base Confidence: ${analysis.confidenceBreakdown.baseConfidence}%`);
    }
    
    console.log(`\n💡 REASONING:`);
    console.log(`  ${analysis.reasoning}`);
    
    console.log('\n========================================');
    console.log('✅ TEST COMPLETE');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
  }
}

testAnalysis();
