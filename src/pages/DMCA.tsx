import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";

import { useTranslation } from "@/contexts/TranslationContext";
import { Shield, Mail, AlertTriangle, FileText, Clock, CheckCircle } from "lucide-react";

const DMCA = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: FileText,
      title: "Identify the Content",
      description: "Clearly identify the copyrighted work that you believe has been infringed and the specific content on our platform that allegedly infringes your copyright."
    },
    {
      icon: Mail,
      title: "Send Notice",
      description: "Send a detailed DMCA takedown notice to our designated agent with all required information as specified below."
    },
    {
      icon: Clock,
      title: "Review Process",
      description: "We will review your notice within 24-48 hours and take appropriate action if the claim is valid."
    },
    {
      icon: CheckCircle,
      title: "Resolution",
      description: "If the claim is valid, we will remove the infringing content and notify the uploader. Invalid claims will be rejected with explanation."
    }
  ];

  const requiredInfo = [
    "Your full legal name and contact information",
    "Description of the copyrighted work you claim has been infringed",
    "URL or specific location of the allegedly infringing material on WaifuVault",
    "A statement that you have a good faith belief that the use is not authorized",
    "A statement that the information in your notice is accurate",
    "Your physical or electronic signature"
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
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-center sm:text-left">
                {t("DMCA")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Digital Millennium Copyright Act (DMCA) Takedown Notice Policy
            </p>
          </div>

          {/* Overview */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-card to-card/80">
            <h2 className="text-2xl font-display font-bold mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              WaifuVault respects the intellectual property rights of others and expects our users to do the same. 
              In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to valid takedown 
              notices and remove infringing content when properly notified.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Important:</strong> DMCA takedown notices have legal implications. 
                  False claims may result in legal liability. Only submit a notice if you are the copyright owner 
                  or authorized to act on behalf of the copyright owner.
                </p>
              </div>
            </div>
          </Card>

          {/* Process Steps */}
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-center mb-8">DMCA Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((step, index) => (
                <Card key={index} className="p-6 border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-primary">Step {index + 1}</span>
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Required Information */}
          <Card className="p-8 mb-8 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">Required Information for DMCA Notice</h2>
            <p className="text-muted-foreground mb-6">
              To file a valid DMCA takedown notice, you must include the following information:
            </p>
            <div className="space-y-3">
              {requiredInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{info}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl font-display font-bold mb-6">DMCA Agent Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Designated DMCA Agent</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Name:</strong> WaifuVault DMCA Agent</p>
                  <p><strong>Email:</strong> waifucloud@proton.me</p>
                  <p><strong>Response Time:</strong> 24-48 hours</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Notice Requirements</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Must be in writing (email acceptable)</p>
                  <p>• Must include all required information</p>
                  <p>• Must be signed (electronic signature acceptable)</p>
                  <p>• Must be sent to our designated agent</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Counter-Notice */}
          <Card className="p-8 mb-8 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">Counter-Notice Process</h2>
            <p className="text-muted-foreground mb-4">
              If you believe your content was removed in error, you may file a counter-notice. 
              The counter-notice must include:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>• Your name, address, and phone number</li>
              <li>• Identification of the removed content and its location</li>
              <li>• A statement under penalty of perjury that the removal was a mistake</li>
              <li>• Consent to jurisdiction of federal court</li>
              <li>• Your physical or electronic signature</li>
            </ul>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm">
                <strong>Note:</strong> After receiving a valid counter-notice, we may restore the content 
                within 10-14 business days unless the copyright owner files a court action.
              </p>
            </div>
          </Card>

          {/* Legal Disclaimer */}
          <Card className="p-8 border-border/50 bg-gradient-to-br from-red-500/5 to-red-500/10">
            <h2 className="text-2xl font-display font-bold mb-4 text-red-600">Legal Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This DMCA policy is provided for informational purposes and does not constitute legal advice. 
              WaifuVault reserves the right to remove any content at our discretion. Repeat infringers may have 
              their accounts terminated. For complex copyright issues, we recommend consulting with a qualified attorney.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DMCA;