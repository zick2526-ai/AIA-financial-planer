# Client Planning PDF Report

## Module

`report-generator.js`

## User action

After selecting a client, the application exposes a `PDF สรุปลูกค้า` action. The module loads the selected client's planning data and generates a downloadable multi-page A4 PDF.

## Report content

Current design targets four sections/pages:

1. Overall planning summary
   - total annual premium
   - life cover
   - health cover
   - CI cover
   - policy count
   - assets / liabilities / net worth
   - cash-flow indicators
   - cashback / maturity information

2. Health Planner / Gap analysis
   - current health benefit
   - employer benefit
   - target annual limit
   - Health Coverage Gap
   - room gap
   - budget / deductible preferences
   - ranked health-plan recommendations
   - reasons and cautions

3. Premium dashboard
   - annual premium-payment graph by age/year
   - policy table
   - annual premium, life, health and CI values

4. Supporting planning information
   - goals
   - family
   - planning checklist / significant observations
   - report disclaimer

## PDF implementation

The report is first constructed as HTML using normal Thai-capable system fonts. Each A4 page is rendered with `html2canvas`, then inserted into a `jsPDF` document.

This design avoids direct PDF text-layout/font-embedding problems and preserves charts and Thai text as rendered.

## Data sources

The report reads, subject to RLS:
- `clients`
- `financial_profiles`
- `insurance_policies`
- `assets`
- `liabilities`
- `goals`
- `family_members`
- `health_assessments`
- `health_product_plans`

## Premium-series rule

Where policy `yearly_data` contains sufficient annual data, use it. Otherwise the report may derive a premium schedule from annual premium, start age and pay years. Derived values should be treated as planning estimates rather than insurer-issued benefit illustrations.

## Report disclaimer

The PDF is a planning summary, not the insurance contract, underwriting decision or guaranteed quotation. Product details, premiums and benefits should be rechecked against current official documents before presentation or sale.
