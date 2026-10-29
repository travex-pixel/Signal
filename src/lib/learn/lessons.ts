import type { PlateName } from "@/components/Plate";

/**
 * Financial fluency lessons. Each teaches one concept, says why it matters
 * to a distributor, works a short illustrative example (labelled as such)
 * and ends in a knowledge check. Numbers are invented for teaching and are
 * never company data.
 */

export interface KnowledgeCheck {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Lesson {
  slug: string;
  title: string;
  oneLiner: string;
  plate: PlateName;
  minutes: number;
  concept: string[];
  whyItMatters: string[];
  example: { title: string; lines: string[]; takeaway: string };
  check: KnowledgeCheck;
  simulator?: string;
  related: string[];
}

export const LESSONS: Lesson[] = [
  {
    slug: "gross-margin-and-ebitda",
    title: "Gross margin and EBITDA",
    oneLiner: "The two numbers that tell you whether the trading engine works and whether the business can pay for itself.",
    plate: "lesson-margin",
    minutes: 4,
    concept: [
      "Gross margin is what is left of revenue after the direct cost of the goods sold. For a distributor that is the purchase price of resin or film plus the costs of getting it to the warehouse. It is usually quoted as a percentage of revenue, and it measures whether buying and selling is done well.",
      "EBITDA (earnings before interest, tax, depreciation and amortisation) takes gross profit and subtracts the operating costs of running the business: people, premises, vehicles, systems. It approximates the cash the operation generates before financing and investment decisions, which is why lenders and acquirers lean on it.",
      "The relationship between them is the shape of the business. A high gross margin with a low EBITDA margin means the trading is good but the cost base is heavy; a thin gross margin with a respectable EBITDA margin means a lean operation that depends on volume.",
    ],
    whyItMatters: [
      "A supplier price increase that is not passed on hits gross margin first and EBITDA second, in full. Knowing the margin structure tells you how much of a cost move the business can absorb before the operation stops covering its costs.",
      "Percentages and dollars tell different stories. Passing a cost increase through at the same dollar mark-up holds gross profit but lowers the margin percentage; holding the percentage requires a larger price rise. In meetings, say which one you mean.",
    ],
    example: {
      title: "Illustrative: a distributor with $10m monthly revenue",
      lines: [
        "Revenue $10.0m; cost of goods $8.3m; gross profit $1.7m (17% gross margin).",
        "Operating costs $1.2m; EBITDA $0.5m (5% EBITDA margin).",
        "A 3% supplier price rise on all goods, not passed on, adds $0.25m to cost of goods: gross margin falls to 14.5% and EBITDA halves to $0.25m.",
        "Passing the full dollar increase through restores EBITDA but leaves gross margin at 16.5%, because the same dollars are now a smaller share of a larger revenue.",
      ],
      takeaway: "Thin EBITDA margins turn small cost moves into large profit moves. The lever is pass-through, and the clock is how long the business carries the gap.",
    },
    check: {
      question: "A business has 17% gross margin and 5% EBITDA margin. A cost increase equal to 3% of revenue is absorbed, not passed on. Roughly what happens to EBITDA?",
      options: ["It falls by about 3%", "It falls by about 60%", "It is unchanged because costs are fixed", "It rises because revenue is unchanged"],
      answer: 1,
      explanation: "The 3 points come straight off a 5-point EBITDA margin: EBITDA falls from 5% of revenue to 2%, a drop of about 60%. Operating leverage cuts both ways.",
    },
    simulator: "margin-and-ebitda",
    related: ["supplier-price-increases", "demand-and-trade-offs"],
  },
  {
    slug: "profit-and-loss",
    title: "Profit and loss, balance sheet, cash flow",
    oneLiner: "Three statements, one business: what it earned, what it owns and owes, and where the cash went.",
    plate: "lesson-pnl",
    minutes: 5,
    concept: [
      "The profit and loss statement shows revenue, costs and profit over a period. The balance sheet is a photograph at a date: assets (cash, receivables, inventory, equipment), liabilities (payables, borrowings) and equity. The cash flow statement reconciles the two by showing where cash came from and went: operations, investment and financing.",
      "Profit and cash differ because of timing. A sale is profit when invoiced but cash when paid; a purchase is cost when the goods are sold but cash when the supplier is paid; stock on the floor is an asset that has consumed cash but not yet touched profit.",
      "For a distributor the balance sheet is mostly working capital: inventory and receivables funded by payables and borrowings. The profit and loss can look healthy while cash is tight, if stock is building or customers are paying slowly.",
    ],
    whyItMatters: [
      "Supplier conversations are balance-sheet conversations in disguise. Payment terms, consignment stock, minimum order quantities and lead times all move cash before they move profit.",
      "A world event that lengthens lead times (a shipping disruption, say) raises inventory in transit, which consumes cash with no change in sales. Reading the balance sheet tells you how much of that the business can carry.",
    ],
    example: {
      title: "Illustrative: the same month, three views",
      lines: [
        "P&L: revenue $10.0m, gross profit $1.7m, EBITDA $0.5m, net profit after interest, depreciation and tax $0.25m.",
        "Balance sheet: inventory $8.0m, receivables $12.0m, payables $6.0m; net working capital $14.0m, funded by a $9m facility and equity.",
        "Cash flow: profit $0.25m, plus depreciation $0.1m, less an inventory build of $1.0m (a shipment arrived early) equals a cash outflow of $0.65m despite a profitable month.",
      ],
      takeaway: "A profitable month can be a cash-negative month. Ask which statement the number in front of you comes from.",
    },
    check: {
      question: "A large shipment arrives two weeks early and sits in the warehouse unsold at month end. Which statement moves immediately, and how?",
      options: ["P&L: cost of goods rises", "Balance sheet: inventory rises and cash or payables move", "Cash flow: operating profit falls", "None, until the goods are sold"],
      answer: 1,
      explanation: "Unsold stock is an asset on the balance sheet. It consumes cash (or raises payables) now, and reaches the P&L only when it is sold.",
    },
    simulator: "margin-and-ebitda",
    related: ["working-capital", "inventory-and-service-levels"],
  },
  {
    slug: "working-capital",
    title: "Working capital and cash conversion",
    oneLiner: "How many days of cash the business lends to its customers and its warehouse before suppliers lend it back.",
    plate: "lesson-cycle",
    minutes: 4,
    concept: [
      "The cash conversion cycle counts the days between paying a supplier and being paid by a customer: days of inventory, plus days customers take to pay, minus days taken to pay suppliers. Each day in the cycle is cash the business must fund.",
      "For a distributor the cycle is often long: stock arrives by sea and waits for orders, customers take 45 to 60 days to pay, and overseas suppliers may want payment before shipment. Shortening the cycle by a day frees a day of cost of goods in cash.",
      "Financing that cash has a cost, set by interest rates. When rates rise, the same cycle costs more to carry, which is one reason central-bank decisions reach a distributor's profit even when demand is unchanged.",
    ],
    whyItMatters: [
      "Supplier terms are a lever worth as much as price. Thirty extra days of payment terms on a $29m annual cost of goods frees roughly $2.4m of cash, which at 7% is $170,000 a year.",
      "Longer lead times from a disrupted route lengthen the cycle directly: the goods are paid for earlier relative to when they sell.",
    ],
    example: {
      title: "Illustrative: 75 days of cash",
      lines: [
        "Annual revenue $36.5m, cost of goods $29.2m, so cost of goods is $80,000 per day.",
        "Customers pay in 45 days, stock turns in 60 days, suppliers are paid in 30 days: a 75-day cycle.",
        "Receivables $4.5m plus inventory $4.8m less payables $2.4m equals $6.9m of net working capital. At a 7% financing rate that costs about $480,000 a year.",
        "Cutting inventory days from 60 to 50 frees about $800,000 of cash and saves about $56,000 a year in financing.",
      ],
      takeaway: "Every day in the cycle has a price. Negotiate days as carefully as cents per kilo.",
    },
    check: {
      question: "Which change shortens the cash conversion cycle?",
      options: ["Customers paying in 60 days instead of 45", "Holding 10 more days of stock to protect service", "Negotiating 60-day supplier terms instead of 30", "Paying suppliers at order rather than on shipment"],
      answer: 2,
      explanation: "Days payable are subtracted from the cycle, so longer supplier terms shorten it. The other options all lengthen the time the business waits for its cash.",
    },
    simulator: "working-capital",
    related: ["profit-and-loss", "inventory-and-service-levels"],
  },
  {
    slug: "inventory-and-service-levels",
    title: "Inventory, stockouts and service levels",
    oneLiner: "Why the last few points of service level cost the most, and what lead-time variability does to the stock you must hold.",
    plate: "lesson-inventory",
    minutes: 5,
    concept: [
      "Service level is the share of demand met from stock. Safety stock is the extra inventory held above expected demand during the lead time, to cover the days when demand runs high or a shipment runs late. The stock needed rises with demand variability, with lead-time variability and, sharply, with the service level targeted.",
      "The relationship is not linear. Moving from 90% to 95% service costs roughly 30% more safety stock; from 95% to 99% costs roughly 40% more again. The final points of service are the most expensive to buy with inventory.",
      "Lead-time variability matters as much as lead-time length. A supplier who is reliably 35 days away needs less safety stock than one who is 25 days on average but anywhere between 15 and 45.",
    ],
    whyItMatters: [
      "A shipping disruption that adds a week and makes arrivals unpredictable does not just delay one order; it raises the safety stock needed for every line sourced through that route, for as long as the disruption lasts.",
      "Stockouts have a price too: lost sales, customers trying a competitor, and emergency freight. The right service level balances the cost of holding stock against the cost of running out, and it is different for a fast-moving commodity grade and a slow specialty.",
    ],
    example: {
      title: "Illustrative: one grade, one supplier",
      lines: [
        "Demand averages 10 tonnes a day with a standard deviation of 3; lead time averages 30 days with a standard deviation of 5.",
        "At a 95% service level the safety stock is about 90 tonnes; the reorder point is 300 tonnes of expected lead-time demand plus the safety stock.",
        "If lead-time variability doubles to 10 days, safety stock rises to about 170 tonnes at the same service level, roughly $140,000 more inventory at $1,800 a tonne.",
        "Raising the target to 99% instead costs about 40% more safety stock than 95%.",
      ],
      takeaway: "Reliability is cheaper than inventory. A more predictable supplier can be worth more than a cheaper one.",
    },
    check: {
      question: "A supplier's average lead time is unchanged but it becomes much less predictable. To keep the same service level, safety stock should:",
      options: ["Stay the same, since average lead time is unchanged", "Fall, because some shipments now arrive early", "Rise, because variability drives safety stock", "Be replaced by faster freight"],
      answer: 2,
      explanation: "Safety stock protects against variability, not averages. Unpredictable lead times need more cover even when the mean is unchanged.",
    },
    simulator: "inventory-and-stockouts",
    related: ["working-capital", "freight-and-landed-cost"],
  },
  {
    slug: "fx-exposure",
    title: "Foreign exchange exposure",
    oneLiner: "You buy in US dollars and sell in Australian dollars. The gap between them is a cost line you can measure and manage.",
    plate: "lesson-fx",
    minutes: 4,
    concept: [
      "Most internationally traded resin is priced in US dollars. An Australian importer's cost in AUD is the USD price divided by the AUD/USD rate. When the Australian dollar weakens (the rate falls from 0.65 to 0.60), the same USD price costs more AUD; when it strengthens, costs fall.",
      "Exposure is the amount of USD that must be bought in a period before it is hedged. A hedge, usually a forward contract, locks the rate for part of that amount, trading away both the risk and the upside.",
      "Suppliers' own currencies matter too. A supplier whose currency has weakened against the dollar earns more at the same USD price and may have room to hold or cut; one whose currency has strengthened may push for increases.",
    ],
    whyItMatters: [
      "A five-cent move in AUD/USD is a cost move of about 8% on every unhedged USD purchase, instantly and across all origins. Few supplier negotiations move prices that much.",
      "Currency also reaches demand: a weaker AUD lifts import prices and inflation, shapes the next interest-rate decision, and changes customers' competitiveness.",
    ],
    example: {
      title: "Illustrative: 500 tonnes a month at US$1,000",
      lines: [
        "At AUD/USD 0.65 the AUD cost is $1,538 a tonne, or $769,000 a month.",
        "If the rate falls to 0.60, the AUD cost is $1,667 a tonne, or $833,000 a month: $64,000 more for the same goods.",
        "With half the month's purchases hedged at 0.65, the effective cost is $1,603 a tonne and the extra outlay is halved to $32,000.",
      ],
      takeaway: "Know three numbers: the exposure, the hedge ratio and the rate at which current pricing breaks even.",
    },
    check: {
      question: "The AUD/USD rate moves from 0.65 to 0.70. For an unhedged importer paying USD, landed costs in AUD:",
      options: ["Rise by about 7%", "Fall by about 7%", "Are unchanged until suppliers reprice", "Rise only on new orders"],
      answer: 1,
      explanation: "A stronger Australian dollar buys more US dollars, so the same USD price costs fewer AUD: 1/0.70 is about 7% less than 1/0.65. The effect applies to every open unhedged order.",
    },
    simulator: "exchange-rate",
    related: ["supplier-price-increases", "freight-and-landed-cost"],
  },
  {
    slug: "freight-and-landed-cost",
    title: "Freight and landed cost",
    oneLiner: "The quote is not the cost. Landed cost adds freight, duty, insurance and handling, and each moves on its own.",
    plate: "lesson-freight",
    minutes: 4,
    concept: [
      "Landed cost is the full cost of a tonne of product in your warehouse: the supplier's price, sea freight, insurance, duties and taxes, port charges, handling and local delivery. Comparing suppliers on the quote alone ignores everything after the ship's rail.",
      "Freight is quoted per container, so its cost per tonne depends on how much fits in one. Heavier loads dilute freight; light or bulky goods, such as film, carry more freight per tonne of value.",
      "Freight rates are volatile. Container rates on Asia–Australia lanes can double in a disruption and fall back within months. Because freight is a modest share of landed cost for dense commodity resin, even a large rate move is a small landed-cost move; for lighter products the share is higher.",
    ],
    whyItMatters: [
      "A headline about freight rates doubling sounds alarming; on a tonne of resin it may be a 3% landed-cost change. Doing the arithmetic turns a headline into a number you can act on.",
      "Tariffs and duties are landed-cost items too. A tariff announced in another market changes your landed cost only if your lane crosses that border, but it may change competitors' costs and, through diverted trade, the supplier's price.",
    ],
    example: {
      title: "Illustrative: a tonne of resin from Southeast Asia",
      lines: [
        "FOB price $1,500 a tonne; freight $2,500 a container at 25 tonnes, so $100 a tonne; duty 5% ($75); insurance, port and delivery $40.",
        "Landed cost $1,715 a tonne. Freight is about 6% of it.",
        "If freight rises 50%, landed cost rises $50 to $1,765, a 2.9% change. If duty were removed under a trade agreement, landed cost would fall by $75.",
      ],
      takeaway: "Work in landed cost per tonne and the headlines fall into proportion.",
    },
    check: {
      question: "Container freight on your lane doubles. Freight was 6% of landed cost. Roughly how much does landed cost change?",
      options: ["About 6%", "About 12%", "About 50%", "It doubles"],
      answer: 0,
      explanation: "Doubling a 6% component adds another 6% to the total. The freight headline is dramatic; the landed-cost effect is modest for dense goods.",
    },
    simulator: "freight-and-landed-cost",
    related: ["fx-exposure", "inventory-and-service-levels"],
  },
  {
    slug: "supplier-price-increases",
    title: "Supplier price increases",
    oneLiner: "What a supplier's increase does to your margin, how much to pass through, and what to ask before agreeing.",
    plate: "lesson-price-steps",
    minutes: 5,
    concept: [
      "A supplier price increase arrives with a reason: feedstock, energy, currency, capacity or simply the market. The reason tells you how durable the increase is likely to be and whether competitors face it too, which decides how much can be passed on.",
      "Pass-through is the share of the cost increase recovered in selling prices. Full pass-through holds gross profit in dollars but lowers the margin percentage; holding the percentage requires raising prices by more than the cost increase. Partial pass-through splits the loss between the business and its customers.",
      "Timing matters as much as amount. Increases that land before selling prices can move create a gap that is paid for every day it persists; stock bought at old prices and sold at new ones creates a temporary windfall.",
    ],
    whyItMatters: [
      "In a commodity market the first question is whether the increase is specific to one supplier or shared by all. A shared increase (a feedstock move) can usually be passed on; a supplier-specific one is a negotiation.",
      "Reading the mechanism behind the increase (crude for naphtha-based producers, gas for ethane-based ones, currency for everyone) tells you which suppliers will move next and who has room to hold.",
    ],
    example: {
      title: "Illustrative: a 10% increase on a $1,500 tonne",
      lines: [
        "Cost rises from $1,500 to $1,650; selling price was $1,800, a 16.7% gross margin, on 100 tonnes a month.",
        "No pass-through: margin falls to 8.3%; gross profit falls $15,000 a month.",
        "Full dollar pass-through to $1,950 holds the $30,000 of monthly gross profit, but margin is now 15.4%.",
        "Holding 16.7% margin needs a price of $1,980, an increase of 10% on the selling price for a 10% increase on cost.",
      ],
      takeaway: "Decide in advance whether you defend dollars or percentage; they need different prices.",
    },
    check: {
      question: "A supplier raises prices 10%, citing higher naphtha costs. Which fact most strengthens the case for passing the increase on in full?",
      options: ["The supplier is your largest", "Competitors source from ethane-based US producers whose costs did not move", "All regional producers are naphtha-based and face the same move", "Your customers have long contracts"],
      answer: 2,
      explanation: "When every competitor faces the same cost move, the market price tends to move with it and pass-through is defensible. If competitors' costs did not move, passing on an increase risks losing volume.",
    },
    simulator: "supplier-price-change",
    related: ["gross-margin-and-ebitda", "fx-exposure"],
  },
  {
    slug: "demand-and-trade-offs",
    title: "Demand changes and commercial trade-offs",
    oneLiner: "When demand softens, price and volume pull in opposite directions. Operating leverage decides which hurts more.",
    plate: "lesson-tradeoffs",
    minutes: 4,
    concept: [
      "A fall in demand reduces revenue and, with it, gross profit; fixed operating costs do not fall, so EBITDA falls by the full lost gross profit. The volume at which gross profit just covers fixed costs is break-even.",
      "The usual responses, cutting price to hold volume or holding price and accepting lower volume, have different arithmetic. A price cut flows straight through margin on every tonne; a volume loss removes only the margin on the lost tonnes. At a thin margin, a small price cut can cost more than a large volume loss.",
      "Demand signals can be consumption or inventory. When customers expect weaker demand they destock, so orders fall faster than consumption; when confidence returns they restock. Reacting to destocking as if it were consumption leads to over-correction.",
    ],
    whyItMatters: [
      "A retail-spending headline reaches a distributor through customers' order patterns weeks later. The useful question is whether orders are tracking the signal, and whether it is destocking or demand.",
      "Knowing break-even volume tells you how much room there is before a softer market becomes a loss-making one, and therefore how much price can be sacrificed to protect volume.",
    ],
    example: {
      title: "Illustrative: $1m a month at 20% margin",
      lines: [
        "Revenue $1.0m, gross profit $200,000, fixed costs $150,000, EBITDA $50,000.",
        "Volume falls 10%: gross profit falls to $180,000; EBITDA falls to $30,000, down 40%.",
        "Instead, price is cut 5% to hold volume: gross profit falls to $150,000; EBITDA is zero.",
        "Break-even is a 25% fall in volume; the business can lose a quarter of its volume before losing money, but only a 5% price cut.",
      ],
      takeaway: "At thin margins, price is the sharper knife. Protect it first.",
    },
    check: {
      question: "Gross margin is 20%, EBITDA margin 5%. Which response to a softer market costs more EBITDA?",
      options: ["Losing 10% of volume at unchanged prices", "Cutting prices 5% to hold volume", "They cost the same", "Neither affects EBITDA"],
      answer: 1,
      explanation: "A 5% price cut removes 5 points of margin on all revenue, wiping out the 5-point EBITDA margin. A 10% volume loss removes only 10% of gross profit, about 2 points of revenue.",
    },
    simulator: "demand-slowdown",
    related: ["gross-margin-and-ebitda", "supplier-price-increases"],
  },
];

export const LESSON_BY_SLUG: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.slug, l]));
