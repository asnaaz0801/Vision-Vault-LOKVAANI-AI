const fs = require('fs');

let html = fs.readFileSync('home/submit.html', 'utf8');

// Define the exact blocks to extract and rearrange
// Step 1: from `<!-- STEP 1: SELECT ISSUE CATEGORY -->` to `<!-- STEP 2: ISSUE UNDER DEPARTMENT -->`
const step1Idx = html.indexOf('<!-- STEP 1: SELECT ISSUE CATEGORY -->');
const step2OldIdx = html.indexOf('<!-- STEP 2: ISSUE UNDER DEPARTMENT -->');
const step3OldIdx = html.indexOf('<!-- STEP 3: DYNAMIC SUBCATEGORY SELECTION -->');
const step4OldIdx = html.indexOf('<!-- STEP 4: ESTIMATED IMPACT -->');
const step5OldIdx = html.indexOf('<!-- STEP 5: DESCRIBE YOUR ISSUE -->');
const step6OldIdx = html.indexOf('<!-- STEP 6: ISSUE LOCATION -->');
const stepPreviewIdx = html.indexOf('<!-- STEP 7: FULL-WIDTH AI COMPLAINT PREVIEW');

if (step1Idx === -1 || step2OldIdx === -1 || step3OldIdx === -1 || step4OldIdx === -1 || step5OldIdx === -1 || step6OldIdx === -1 || stepPreviewIdx === -1) {
  console.error('Failed to locate section markers in submit.html');
  process.exit(1);
}

// 1. Step 1 content
const step1Content = html.substring(step1Idx, step2OldIdx).trim();

// 2. Old Step 2 (Issue Under Department) content -> will become Step 7
let deptContent = html.substring(step2OldIdx, step3OldIdx).trim();
// Update badge to 7 and add id="section-dept-routing"
deptContent = deptContent.replace('<!-- STEP 2: ISSUE UNDER DEPARTMENT -->', '<!-- STEP 7: ISSUE UNDER DEPARTMENT -->');
deptContent = deptContent.replace('<span class="step-badge-num">2</span>', '<span class="step-badge-num">7</span>');
deptContent = deptContent.replace('<div class="form-section-card">', '<div class="form-section-card" id="section-dept-routing">');

// 3. Old Step 3 (Dynamic Subcategory Selection) -> will become Step 2
let subcatContent = html.substring(step3OldIdx, step4OldIdx).trim();
subcatContent = subcatContent.replace('<!-- STEP 3: DYNAMIC SUBCATEGORY SELECTION -->', '<!-- STEP 2: DYNAMIC SUBCATEGORY SELECTION -->');
subcatContent = subcatContent.replace('<span class="step-badge-num">3</span>', '<span class="step-badge-num">2</span>');

// 4. Old Step 4 (Estimated Impact) -> will become Step 3
let impactContent = html.substring(step4OldIdx, step5OldIdx).trim();
impactContent = impactContent.replace('<!-- STEP 4: ESTIMATED IMPACT -->', '<!-- STEP 3: ESTIMATED IMPACT -->');
impactContent = impactContent.replace('<span class="step-badge-num">4</span>', '<span class="step-badge-num">3</span>');

// 5. Old Step 5 (Describe Your Issue + Evidence Grid) -> split into Step 4 (Describe Your Issue) and Step 5 (Add Evidence)
const step5Full = html.substring(step5OldIdx, step6OldIdx).trim();
const evidenceSplitIdx = step5Full.indexOf('<div class="evidence-grid">');

if (evidenceSplitIdx === -1) {
  console.error('Failed to locate evidence-grid in Step 5');
  process.exit(1);
}

// Extract Describe Your Issue (without evidence-grid)
let descContent = step5Full.substring(0, evidenceSplitIdx).trim();
// Close the form-section-card for Step 4
descContent += '\n        </div>';
descContent = descContent.replace('<!-- STEP 5: DESCRIBE YOUR ISSUE -->', '<!-- STEP 4: DESCRIBE YOUR ISSUE -->');
descContent = descContent.replace('<span class="step-badge-num">5</span>', '<span class="step-badge-num">4</span>');

// Extract Add Evidence into Step 5 card
let evidenceInner = step5Full.substring(evidenceSplitIdx).trim();
// remove any trailing </div> that closed the old combined card
if (evidenceInner.endsWith('</div>')) {
  evidenceInner = evidenceInner.substring(0, evidenceInner.lastIndexOf('</div>')).trim();
}

const evidenceCard = `<!-- STEP 5: ADD EVIDENCE -->
        <div class="form-section-card">
          <div class="form-section-header">
            <span class="step-badge-num">5</span>
            <div class="form-section-title">
              <h3>Add Evidence</h3>
              <span>Attach photographic proof or record a spoken voice grievance</span>
            </div>
          </div>

          ${evidenceInner}
        </div>`;

// 6. Step 6 (Issue Location) content
let locationContent = html.substring(step6OldIdx, stepPreviewIdx).trim();

// 7. Preview & Submit block (from stepPreviewIdx onwards)
let previewAndSubmit = html.substring(stepPreviewIdx);
// Update the comment above AI Complaint Preview
previewAndSubmit = previewAndSubmit.replace('<!-- STEP 7: FULL-WIDTH AI COMPLAINT PREVIEW (Immediately before Submit button) -->', '<!-- STEP 8: FULL-WIDTH AI COMPLAINT PREVIEW -->');

// Build the reordered sections
const reorderedSections = [
  step1Content,
  subcatContent,
  impactContent,
  descContent,
  evidenceCard,
  locationContent,
  deptContent,
  previewAndSubmit
].join('\n\n        ');

// Replace in html
const beforeForm = html.substring(0, step1Idx);
const newHtml = beforeForm + reorderedSections;

fs.writeFileSync('home/submit.html', newHtml, 'utf8');
console.log('Successfully reordered submit.html sections to requested 9-step flow!');
