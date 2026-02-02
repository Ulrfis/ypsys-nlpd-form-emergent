# Homepage and Results Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve homepage with Ypsys logo, simplify statistics display, add visual gauge for results, simplify lead capture form, and integrate booking calendar.

**Architecture:** Frontend-only changes to React components. No backend modifications. Uses existing Framer Motion for animations, adds Recharts for gauge component.

**Tech Stack:** React 19, Framer Motion, Recharts, Tailwind CSS, shadcn/ui

---

## Task 1: Add Ypsys Logo

**Files:**
- Add: `.worktrees/feature/homepage-improvements/frontend/public/logo-ypsys.png`
- Modify: `.worktrees/feature/homepage-improvements/frontend/src/components/LandingPage.jsx:18-24`

**Step 1: Copy logo file to public directory**

Copy the logo PNG file from the project root to the public directory:

```bash
cp /Users/ulrich/CodeProjects/ulrfis/ypsys-nlpd-form-emergent/logo-ypsys.png frontend/public/logo-ypsys.png
```

Expected: File copied successfully

**Step 2: Verify logo file exists**

```bash
ls -lh frontend/public/logo-ypsys.png
```

Expected: File exists and displays size

**Step 3: Update LandingPage.jsx to use logo image**

In `frontend/src/components/LandingPage.jsx`, replace lines 18-24:

```jsx
{/* Logo/Brand */}
<div className="flex items-center justify-center mb-8">
  <img
    src="/logo-ypsys.png"
    alt="Ypsys - time for real performance"
    className="h-16 md:h-20 w-auto"
  />
</div>
```

**Step 4: Test logo displays correctly**

Start dev server:
```bash
cd frontend && npm start
```

Visit http://localhost:3000 and verify:
- Logo displays at correct size
- Logo is centered
- No broken image icon

**Step 5: Commit**

```bash
git add frontend/public/logo-ypsys.png frontend/src/components/LandingPage.jsx
git commit -m "feat: replace Shield icon with Ypsys logo PNG"
```

---

## Task 2: Update Statistics Section

**Files:**
- Modify: `.worktrees/feature/homepage-improvements/frontend/src/components/LandingPage.jsx:39-62`

**Step 1: Replace statistics cards with narrative text**

In `frontend/src/components/LandingPage.jsx`, replace lines 39-62 with:

```jsx
{/* Statistics - Narrative Format */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
  className="text-center mb-10 max-w-3xl mx-auto"
>
  <p className="text-xl md:text-2xl text-foreground leading-relaxed">
    <span className="text-3xl md:text-4xl font-extrabold text-warning">90%</span>{' '}
    des PME suisses pensent être conformes, mais{' '}
    <span className="text-3xl md:text-4xl font-extrabold text-danger">70%</span>{' '}
    ne le sont pas réellement
  </p>
</motion.div>
```

**Step 2: Test statistics display**

Refresh browser at http://localhost:3000 and verify:
- Statistics display as continuous text
- Percentages are larger and bold
- 90% shows in warning color (orange)
- 70% shows in danger color (red)
- Text is centered and readable

**Step 3: Commit**

```bash
git add frontend/src/components/LandingPage.jsx
git commit -m "feat: convert statistics cards to narrative format"
```

---

## Task 3: Update Warning Section

**Files:**
- Modify: `.worktrees/feature/homepage-improvements/frontend/src/components/LandingPage.jsx:86-104`

**Step 1: Remove title and update warning text**

In `frontend/src/components/LandingPage.jsx`, replace lines 86-104 with:

```jsx
{/* Warning Message */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6, delay: 0.6 }}
  className="bg-card border border-border rounded-xl p-6 mb-10 max-w-2xl mx-auto"
>
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
      <AlertTriangle className="w-5 h-5 text-warning" />
    </div>
    <div className="text-left">
      <p className="text-sm text-muted-foreground">
        Elles découvrent leurs failles trop tard : après un{' '}
        <strong>incident de sécurité</strong>, ou lors d&apos;une{' '}
        <strong>réclamation d&apos;un patient/client</strong>.
      </p>
    </div>
  </div>
</motion.div>
```

**Step 2: Test warning section**

Refresh browser and verify:
- Title "La différence?" is removed
- Warning text is updated
- Layout and styling remain consistent

**Step 3: Commit**

```bash
git add frontend/src/components/LandingPage.jsx
git commit -m "feat: update warning section text and remove title"
```

---

## Task 4: Install Recharts for Gauge Component

**Files:**
- Modify: `.worktrees/feature/homepage-improvements/frontend/package.json`

**Step 1: Install Recharts**

```bash
cd frontend && npm install recharts@^2.13.3
```

Expected: Recharts added to dependencies

**Step 2: Verify installation**

```bash
npm list recharts
```

Expected: Shows recharts@2.x.x

**Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add recharts for gauge visualization"
```

---

## Task 5: Create ScoreGauge Component

**Files:**
- Create: `.worktrees/feature/homepage-improvements/frontend/src/components/ScoreGauge.jsx`

**Step 1: Create ScoreGauge component file**

Create `frontend/src/components/ScoreGauge.jsx`:

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export const ScoreGauge = ({ score, size = 200, animated = true }) => {
  // Score should be 0-100
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // Determine color based on score ranges
  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981'; // green/success
    if (score >= 31) return '#f59e0b'; // orange/warning
    return '#ef4444'; // red/danger
  };

  const color = getScoreColor(normalizedScore);

  // Data for the gauge - reversed to show properly in semi-circle
  const data = [
    {
      name: 'score',
      value: normalizedScore,
      fill: color,
    },
  ];

  const containerSize = size + 40; // Add padding for labels

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: containerSize, height: containerSize / 2 + 40 }}>
        {/* Background arc */}
        <svg
          width={containerSize}
          height={containerSize / 2}
          className="absolute top-0 left-0"
        >
          <path
            d={`M ${containerSize * 0.1} ${containerSize / 2 - 20}
                A ${size / 2} ${size / 2} 0 0 1 ${containerSize * 0.9} ${containerSize / 2 - 20}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="20"
            strokeLinecap="round"
          />
        </svg>

        {/* Recharts gauge */}
        <RadialBarChart
          width={containerSize}
          height={containerSize / 2}
          cx={containerSize / 2}
          cy={containerSize / 2}
          innerRadius={size / 2 - 20}
          outerRadius={size / 2}
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={false}
            dataKey="value"
            cornerRadius={10}
            animationBegin={animated ? 300 : 0}
            animationDuration={animated ? 1500 : 0}
            animationEasing="ease-out"
          />
        </RadialBarChart>

        {/* Score text */}
        <div
          className="absolute"
          style={{
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <motion.div
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-foreground">
              {Math.round(normalizedScore)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Score de conformité
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreGauge;
```

**Step 2: Test gauge component in isolation**

Create a temporary test page or view the gauge by importing it in ResultsPreview (next task).

**Step 3: Commit**

```bash
git add frontend/src/components/ScoreGauge.jsx
git commit -m "feat: create ScoreGauge semi-circular gauge component"
```

---

## Task 6: Update ResultsPreview with Gauge and New Texts

**Files:**
- Modify: `.worktrees/feature/homepage-improvements/frontend/src/components/ResultsPreview.jsx:1,45-117`

**Step 1: Import ScoreGauge at top of file**

Add to imports at line 1:

```jsx
import ScoreGauge from './ScoreGauge';
```

**Step 2: Update score configuration with new text templates**

Replace the `scoreConfig` object (lines 18-43) with:

```jsx
const getScoreMessage = (score, firstName) => {
  const name = firstName ? `${firstName}` : 'Utilisateur';
  const percentage = Math.round(score.normalized * 10);

  if (score.riskLevel === 'green') {
    return `Bravo ${name}! Votre organisation obtient un score de ${percentage}%, ce qui indique une bonne maîtrise des exigences nLPD. Quelques ajustements mineurs pourraient renforcer encore votre conformité. Consultez votre email pour un rapport détaillé avec des recommandations personnalisées. Demandez votre rapport complet gratuit.`;
  } else if (score.riskLevel === 'orange') {
    return `Votre organisation obtient un score de ${percentage}%. Des lacunes significatives ont été identifiées dans votre conformité nLPD. Sans action corrective, vous pourriez être exposé à des sanctions et/ou amendes en cas d'audit du PFPDT ou d'incident de sécurité. Demandez votre rapport complet gratuit.`;
  } else {
    return `Attention ${name}! Votre organisation présente un score de ${percentage}%, révélant des failles critiques dans votre conformité nLPD. Un audit du PFPDT pourrait entraîner des sanctions allant jusqu'à CHF 250'000. Pour éviter toute sanction et/ou amende, il est fortement conseillé de commencer une mise en conformité. Demandez votre rapport complet gratuit.`;
  }
};

const scoreConfig = {
  green: {
    color: 'success',
    icon: CheckCircle,
    title: 'Bonne conformité',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success',
  },
  orange: {
    color: 'warning',
    icon: AlertTriangle,
    title: 'Vigilance requise',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    textColor: 'text-warning',
  },
  red: {
    color: 'danger',
    icon: XCircle,
    title: 'Attention requise',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    textColor: 'text-danger',
  },
};
```

**Step 3: Update component to accept firstName prop**

Update the component signature (line 45):

```jsx
export const ResultsPreview = ({ score, teaser, onRequestReport, firstName = '' }) => {
```

**Step 4: Replace score card with gauge**

Replace lines 76-89 (Score Card section) with:

```jsx
{/* Score Gauge */}
<div className="mb-6">
  <ScoreGauge score={score.normalized * 10} size={220} animated={true} />
</div>
```

**Step 5: Update risk level card to use new message**

Replace lines 92-117 (Risk Level Card section) with:

```jsx
{/* Risk Level Message */}
<Card className={cn(
  "border-2 mb-6",
  config.borderColor,
  config.bgColor
)}>
  <CardContent className="p-5">
    <div className="flex items-start gap-4">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        config.bgColor
      )}>
        <ScoreIcon className={cn("w-5 h-5", config.textColor)} />
      </div>
      <div>
        <h3 className={cn("font-semibold mb-2", config.textColor)}>
          {config.title}
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {getScoreMessage(score, firstName)}
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

**Step 6: Test results page**

Navigate to results page in browser and verify:
- Gauge displays correctly with semi-circular design
- Score animates from 0 to actual value
- Gauge colors match score level (red/orange/green)
- Message text includes proper personalization
- All three score levels work (test with different scores if possible)

**Step 7: Commit**

```bash
git add frontend/src/components/ResultsPreview.jsx
git commit -m "feat: integrate ScoreGauge and update result messages"
```

---

## Task 7: Update LeadCaptureForm - Reorganize Fields

**Files:**
- Modify: `.worktrees/feature/homepage-improvements/frontend/src/components/LeadCaptureForm.jsx:23-69,94-131,247-262`

**Step 1: Update form state initial values**

In `frontend/src/components/LeadCaptureForm.jsx`, update lines 23-33 (formData state):

```jsx
const [formData, setFormData] = useState({
  firstName: '', // Now optional
  lastName: '', // Now required
  email: '',
  companyName: '', // Now required
  companySize: '',
  industry: '',
  canton: '',
  consentMarketing: false,
});
```

**Step 2: Update validation function**

Replace the `validateForm` function (lines 38-55) with:

```jsx
const validateForm = () => {
  const newErrors = {};

  if (!formData.lastName.trim()) {
    newErrors.lastName = 'Nom requis';
  }
  if (!formData.companyName.trim()) {
    newErrors.companyName = "Nom de l'entreprise requis";
  }
  if (!formData.email.trim()) {
    newErrors.email = 'Email requis';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Email invalide';
  }
  if (!formData.consentMarketing) {
    newErrors.consentMarketing = 'Vous devez accepter pour recevoir vos résultats';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Step 3: Reorganize required fields section**

Replace lines 94-131 (Required Fields section) with:

```jsx
{/* Required Fields */}
<div className="space-y-4">
  {/* Last Name */}
  <div className="space-y-2">
    <Label htmlFor="lastName" className="flex items-center gap-2">
      <User className="w-4 h-4 text-muted-foreground" />
      Nom <span className="text-danger">*</span>
    </Label>
    <Input
      id="lastName"
      value={formData.lastName}
      onChange={(e) => handleChange('lastName', e.target.value)}
      placeholder="Dupont"
      className={errors.lastName ? 'border-danger' : ''}
    />
    {errors.lastName && (
      <p className="text-sm text-danger">{errors.lastName}</p>
    )}
  </div>

  {/* Company Name */}
  <div className="space-y-2">
    <Label htmlFor="companyName" className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-muted-foreground" />
      Nom de l'entreprise <span className="text-danger">*</span>
    </Label>
    <Input
      id="companyName"
      value={formData.companyName}
      onChange={(e) => handleChange('companyName', e.target.value)}
      placeholder="Cabinet Médical Lausanne SA"
      className={errors.companyName ? 'border-danger' : ''}
    />
    {errors.companyName && (
      <p className="text-sm text-danger">{errors.companyName}</p>
    )}
  </div>

  {/* Email */}
  <div className="space-y-2">
    <Label htmlFor="email" className="flex items-center gap-2">
      <Mail className="w-4 h-4 text-muted-foreground" />
      Email professionnel <span className="text-danger">*</span>
    </Label>
    <Input
      id="email"
      type="email"
      value={formData.email}
      onChange={(e) => handleChange('email', e.target.value)}
      placeholder="jean.dupont@entreprise.ch"
      className={errors.email ? 'border-danger' : ''}
    />
    {errors.email && (
      <p className="text-sm text-danger">{errors.email}</p>
    )}
  </div>
</div>
```

**Step 4: Move First Name to optional section**

Replace lines 145-158 (Last Name in collapsible - now becomes First Name) with:

```jsx
{/* First Name */}
<div className="space-y-2">
  <Label htmlFor="firstName" className="flex items-center gap-2">
    <User className="w-4 h-4 text-muted-foreground" />
    Prénom
  </Label>
  <Input
    id="firstName"
    value={formData.firstName}
    onChange={(e) => handleChange('firstName', e.target.value)}
    placeholder="Jean"
  />
</div>
```

**Step 5: Remove Company Name from optional section**

Delete lines 160-172 (Company Name field in CollapsibleContent).

**Step 6: Update consent checkbox text**

Replace lines 260-261 with:

```jsx
J'accepte de recevoir mes résultats pour sécuriser la conformité nLPD de ma société/cabinet et d'être contacté par YPSYS. <span className="text-danger">*</span>
```

**Step 7: Test form validation**

In browser, test the form:
- Try submitting without filling required fields (Nom, Nom de l'entreprise, Email)
- Verify error messages appear
- Verify consent checkbox is required
- Verify firstName is now optional
- Verify form submits successfully with only required fields

**Step 8: Commit**

```bash
git add frontend/src/components/LeadCaptureForm.jsx
git commit -m "feat: reorganize form fields - make lastName and companyName required, firstName optional"
```

---

## Task 8: Update ThankYouPage with TidyCal Integration

**Files:**
- Modify: `.worktrees/feature/homepage-improvements/frontend/src/components/ThankYouPage.jsx`

**Step 1: Read current ThankYouPage structure**

First, let's check the current file to understand what to modify:

```bash
cat frontend/src/components/ThankYouPage.jsx
```

**Step 2: Add booking section with iframe**

Add the following code after the main thank you message (typically after the first Card component):

```jsx
{/* Booking Calendar Section */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.4 }}
>
  <Card className="border-2 border-primary/20 shadow-elegant">
    <CardHeader className="text-center">
      <CardTitle className="text-xl md:text-2xl">
        Réservez votre consultation gratuite
      </CardTitle>
      <CardDescription className="text-base">
        Discutons de vos résultats et de votre plan d'action personnalisé avec nos experts Ypsys
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="w-full rounded-lg overflow-hidden border border-border">
        <iframe
          src="https://tidycal.com/memoways/30min"
          width="100%"
          height="600"
          frameBorder="0"
          title="Réservation de consultation"
          className="w-full"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ display: 'none' }} className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Le calendrier ne peut pas être affiché directement.
          </p>
          <Button variant="premium" size="lg" asChild>
            <a
              href="https://tidycal.com/memoways/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Réserver un rendez-vous
              <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        Nos experts sont à votre disposition pour vous accompagner dans votre mise en conformité nLPD
      </p>
    </CardContent>
  </Card>
</motion.div>
```

**Step 3: Ensure required imports**

Make sure these imports are at the top of the file:

```jsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
```

**Step 4: Test ThankYou page**

Complete the form flow and verify:
- TidyCal iframe loads and displays calendar
- Iframe is responsive and properly sized
- If iframe fails, fallback button appears
- Page layout is clean and professional

**Step 5: Commit**

```bash
git add frontend/src/components/ThankYouPage.jsx
git commit -m "feat: integrate TidyCal booking calendar in thank you page"
```

---

## Task 9: End-to-End Testing

**Files:**
- None (testing only)

**Step 1: Test complete user flow**

Starting from homepage:
1. Verify logo displays correctly
2. Verify statistics show as narrative text
3. Verify warning section has updated text
4. Click "Commencer l'évaluation"
5. Complete questionnaire
6. Verify gauge displays on results page with correct score
7. Verify result message matches score level
8. Submit lead form with only required fields
9. Verify thank you page displays
10. Verify TidyCal iframe loads

**Step 2: Test responsive design**

Test on different screen sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

Verify:
- Logo scales appropriately
- Gauge remains visible and centered
- Form fields stack properly
- Iframe adapts to screen size

**Step 3: Test different score scenarios**

If possible, test with different scores to verify:
- Low score (0-30%) shows red gauge and "Attention" message
- Medium score (31-69%) shows orange gauge and "Vigilance" message
- High score (70-100%) shows green gauge and "Conforme" message

**Step 4: Test form validation**

Verify:
- Cannot submit without Nom
- Cannot submit without Nom de l'entreprise
- Cannot submit without Email
- Cannot submit without consent checkbox
- Can submit with only required fields (optional fields blank)
- Proper error messages display

**Step 5: Document any issues**

If any issues found, create a list and address them before final commit.

---

## Task 10: Final Verification and Cleanup

**Files:**
- All modified files

**Step 1: Run frontend build**

```bash
cd frontend && npm run build
```

Expected: Build completes successfully with no errors

**Step 2: Check for console errors**

In browser DevTools console, verify:
- No React errors or warnings
- No failed network requests
- No 404s for assets

**Step 3: Review all changes**

```bash
git diff main --stat
```

Verify all expected files are modified:
- LandingPage.jsx
- ScoreGauge.jsx (new)
- ResultsPreview.jsx
- LeadCaptureForm.jsx
- ThankYouPage.jsx
- logo-ypsys.png (new)
- package.json (recharts added)

**Step 4: Final commit if needed**

If any small fixes were made during testing:

```bash
git add .
git commit -m "chore: final testing fixes and cleanup"
```

**Step 5: Push to remote**

```bash
git push origin feature/homepage-improvements
```

---

## Verification Checklist

Before marking complete, verify:

**Homepage (LandingPage.jsx):**
- [ ] Ypsys logo displays instead of Shield icon
- [ ] Logo is properly sized and centered
- [ ] Statistics show as narrative text (not cards)
- [ ] 90% and 70% are large, bold, and colored
- [ ] Warning section has no "La différence?" title
- [ ] Warning text matches new copy

**Results Page (ResultsPreview.jsx):**
- [ ] ScoreGauge displays as semi-circular gauge
- [ ] Gauge has three colored zones (red/orange/green)
- [ ] Score percentage displays in center
- [ ] Gauge animates on page load
- [ ] Result message matches score level
- [ ] Personalization with firstName works
- [ ] All three score levels tested (if possible)

**Lead Capture Form (LeadCaptureForm.jsx):**
- [ ] Nom is required field (first)
- [ ] Nom de l'entreprise is required field (second)
- [ ] Email professionnel is required field (third)
- [ ] Prénom is optional (in collapsible)
- [ ] Consent text matches new copy
- [ ] Form validation works correctly
- [ ] Can submit with only required fields

**Thank You Page (ThankYouPage.jsx):**
- [ ] TidyCal iframe loads successfully
- [ ] Iframe is properly sized (600px height)
- [ ] Fallback button appears if iframe fails
- [ ] Page layout is clean and professional
- [ ] Expert availability message displays

**General:**
- [ ] No console errors in browser
- [ ] Responsive on mobile, tablet, desktop
- [ ] All animations work smoothly
- [ ] Build completes without errors
- [ ] All commits have descriptive messages

---

## Notes

- **Testing URL**: http://localhost:3000
- **TidyCal URL**: https://tidycal.com/memoways/30min (temporary, replace later)
- **Logo file**: Must be in `frontend/public/` directory
- **Score calculation**: Score should be 0-100 for gauge, 0-10 for display in message

## Dependencies Added

```json
{
  "recharts": "^2.13.3"
}
```

## Estimated Time

- Task 1-3: 30 minutes (Homepage changes)
- Task 4-6: 90 minutes (Gauge component and integration)
- Task 7: 30 minutes (Form reorganization)
- Task 8: 30 minutes (Calendar integration)
- Task 9-10: 30 minutes (Testing and cleanup)

**Total: ~3.5 hours**
