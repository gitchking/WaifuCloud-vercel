import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { FileText, Users, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const TermsOfUse = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using WaifuVault, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Description of Service",
      content: "WaifuVault is a platform for sharing and discovering anime-related wallpapers. We provide tools for users to upload, categorize, search, and download high-quality anime artwork for personal use."
    },
    {
      title: "3. User Accounts",
      content: "You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account."
    },
    {
      title: "4. User Conduct",
      content: "You agree not to use the service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service. You must not attempt to gain unauthorized access to any part of the service."
    },
    {
      title: "5. Content Guidelines",
      content: "All uploaded content must be anime-related and comply with our community guidelines. NSFW content must be properly tagged. We reserve the right to remove content that violates our policies."
    },
    {
      title: "6. Intellectual Property",
      content: "You retain ownership of content you upload, but grant us a license to display, distribute, and modify it as necessary to provide our services. You must have the right to upload any content you share."
    },
    {
      title: "7. Privacy",
      content: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding your personal information."
    },
    {
      title: "8. Disclaimers",
      content: "The service is provided 'as is' without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of any information on the service."
    },
    {
      title: "9. Limitation of Liability",
      content: "In no event shall WaifuVault be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service."
    },
    {
      title: "10. Modifications",
      content: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms."
    }
  ];

  const userRights = [
    "Access and use the service for personal purposes",
    "Upload and share anime-related content you own or have permission to share",
    "Download wallpapers for personal use",
    "Create and customize your profile",
    "Participate in community discussions",
    "Request account deletion and data removal"
  ];

  const userResponsibilities = [
    "Provide accurate account information",
    "Respect intellectual property rights",
    "Follow community guidelines and content policies",
    "Report violations and inappropriate content",
    "Maintain account security",
    "Use the service lawfully and ethically"
  ];

  const prohibitedActivities = [
    "Uploading copyrighted content without permission",
    "Sharing malicious software or harmful code",
    "Attempting to hack or compromise the service",
    "Creating multiple accounts to circumvent restrictions",
    "Spamming or sending unsolicited communications",
    "Impersonating other users or entities",
    "Uploading content that violates laws or regulations",
    "Using automated tools to scrape or download content in bulk"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
              <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 rounded-full gradient-primary items-center justify-center">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-center sm:text-left">
                {t("Terms of Use")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using WaifuVault
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Important Notice */}
          <Card className="p-6 mb-8 border-border/50 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Important Legal Agreement</h3>
                <p className="text-sm text-muted-foreground">
                  These Terms of Use constitute a legally binding agreement between you and WaifuVault. 
                  By using our service, you agree to comply with all terms outlined below.
                </p>
              </div>
            </div>
          </Card>

          {/* User Rights and Responsibilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 border-border/50 bg-gradient-to-br from-green-500/5 to-green-500/10">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="font-semibold text-green-700">Your Rights</h3>
              </div>
              <ul className="space-y-2">
                {userRights.map((right, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    {right}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-blue-500" />
                <h3 className="font-semibold text-blue-700">Your Responsibilities</h3>
              </div>
              <ul className="space-y-2">
                {userResponsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    {responsibility}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Prohibited Activities */}
          <Card className="p-6 mb-8 border-border/50 bg-gradient-to-br from-red-500/5 to-red-500/10">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <h3 className="font-semibold text-red-700">Prohibited Activities</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The following activities are strictly prohibited on WaifuVault:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prohibitedActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  {activity}
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Terms */}
          <div className="space-y-6 mb-8">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Detailed Terms</h2>
            {sections.map((section, index) => (
              <Card key={index} className="p-6 border-border/50">
                <h3 className="font-semibold mb-3 text-primary">{section.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {section.content}
                </p>
              </Card>
            ))}
          </div>

          {/* Account Termination */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
            <h2 className="text-2xl font-display font-bold mb-6">Account Termination</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Voluntary Termination</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You may terminate your account at any time through your profile settings. 
                  Upon termination, your personal data will be deleted according to our Privacy Policy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Involuntary Termination</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  We may terminate accounts that violate these terms, engage in prohibited activities, 
                  or pose a risk to our service or community.
                </p>
              </div>
            </div>
          </Card>

          {/* Dispute Resolution */}
          <Card className="p-8 mb-8 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">Dispute Resolution</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Any disputes arising from these terms or your use of WaifuVault will be resolved through 
                the following process:
              </p>
              <ol className="space-y-2 ml-6">
                <li>1. <strong>Direct Communication:</strong> Contact our support team to resolve the issue informally</li>
                <li>2. <strong>Mediation:</strong> If direct communication fails, we may engage in mediation</li>
                <li>3. <strong>Arbitration:</strong> Binding arbitration may be required for unresolved disputes</li>
              </ol>
              <p className="text-sm">
                These terms are governed by the laws of the jurisdiction where WaifuVault operates.
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-8 border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl font-display font-bold mb-4 text-center">Questions About These Terms?</h2>
            <p className="text-muted-foreground text-center mb-6">
              If you have questions about these Terms of Use, please contact us.
            </p>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Legal Questions:</strong> legal@waifuvault.com<br />
                <strong>General Support:</strong> support@waifuvault.com
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;