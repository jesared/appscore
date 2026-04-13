import { flowerScoringExamples } from "@/data/flowers-scoring-examples";
import { calculateFlowerScore } from "@/lib/flowers/scoring";

for (const example of flowerScoringExamples) {
  const result = calculateFlowerScore(example.board);

  console.log(`\n[${example.id}] ${example.title}`);
  console.log(`invalidCards=${result.invalidCards.length}`);
  console.log(`penalty=${result.penalty}`);
  console.log(`colorGroups=${result.colorGroups.length}`);
  console.log(`colorPoints=${result.colorPoints}`);
  console.log(`butterflyPoints=${result.butterflyPoints}`);
  console.log(`total=${result.total}`);
}
