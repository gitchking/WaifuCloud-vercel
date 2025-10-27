import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { Shield, Eye, Lock, Database, Globe, UserCheck, Settings, Trash2 } from "lucide-react";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const dataTypes = [
    {
      icon: UserCheck,
      title: "Account Information",
      description: "Email address, username, profile picture, and account preferences",
      retention: "Until account deletion"
    },
    {
      icon: Database,
      title: "Content Data",
      description: "Uploaded wallpapers, titles, descriptions, tags, and metadata",
      retention: "Until content deletion"
    },
    {
      icon: Eye,
      title: "Usage Analytics",
      description: "Page views, search queries, download statistics (anonymized)",
      retention: "12 months"
    },
    {
      icon: Globe,
      title: "Technical Data",
      description: "IP address, browser type, device information, session data",
      retention: "30 days"
    }
  ];

  const dataUses = [
    "Providing and improving our wallpaper sharing service",
    "Personalizing your experience and recommendations",
    "Communicating with you about your account and service updates",
    "Analyzing usage patterns to improve platform performance",
    "Detecting and preventing fraud, abuse, and security threats",
    "Complying with legal obligations and enforcing our terms"
  ];

  const userRights = [
    {
      icon: Eye,
      title: "Right to Access",
      description: "Request a copy of all personal data we hold about you"
    },
    {
      icon: Settings,
      title: "Right to Rectification",
      description: "Correct inaccurate or incomplete personal information"
    },
    {
      icon: Trash2,
      title: "Right to Erasure",
      description: "Request deletion of your personal data and account"
    },
    {
      icon: Lock,
      title: "Right to Portability",
      description: "Export your data in a machine-readable format"
    }
  ];

  const securityMeasures = [
    "End-to-end encryption for data transmission",
    "Secure password hashing and storage",
    "Regular security audits and vulnerability assessments",
    "Access controls and authentication systems",
    "Automated backup and disaster recovery procedures",
    "Staff training on data protection and privacy"
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
                {t("Privacy Policy")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your data.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Privacy Commitment */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-card to-card/80">
            <h2 className="text-2xl font-display font-bold mb-4">Our Privacy Commitment</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At WaifuVault, we are committed to protecting your privacy and ensuring the security of your 
              personal information. This Privacy Policy explains how we collect, use, store, and protect 
              your data when you use our anime wallpaper platform.
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm">
                <strong>Key Principle:</strong> We only collect data that is necessary to provide and improve 
                our service. We never sell your personal information to third parties.
              </p>
            </div>
          </Card>

          {/* Data We Collect */}
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Data We Collect</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataTypes.map((dataType, index) => (
                <Card key={index} className="p-6 border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <dataType.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{dataType.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                    {dataType.description}
                  </p>
                  <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                    Retention: {dataType.retention}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* How We Use Your Data */}
          <Card className="p-8 mb-8 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">How We Use Your Data</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect for the following purposes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dataUses.map((use, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {use}
                </div>
              ))}
            </div>
          </Card>

          {/* Data Sharing */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <h2 className="text-2xl font-display font-bold mb-6">Data Sharing and Third Parties</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-blue-700">We DO NOT share your data with:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• Advertisers or marketing companies</li>
                  <li>• Data brokers or analytics companies</li>
                  <li>• Social media platforms (unless you explicitly connect)</li>
                  <li>• Any third party for commercial purposes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-blue-700">We MAY share limited data with:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• Cloud hosting providers (for service operation)</li>
                  <li>• Security services (for fraud prevention)</li>
                  <li>• Legal authorities (when required by law)</li>
                  <li>• Service providers (under strict data protection agreements)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Your Rights */}
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Your Privacy Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRights.map((right, index) => (
                <Card key={index} className="p-6 border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <right.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-700">{right.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {right.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Security Measures */}
          <Card className="p-8 mb-8 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">Security Measures</h2>
            <p className="text-muted-foreground mb-4">
              We implement comprehensive security measures to protect your personal information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {securityMeasures.map((measure, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {measure}
                </div>
              ))}
            </div>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
            <h2 className="text-2xl font-display font-bold mb-6">Cookies and Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Essential Cookies</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Required for basic site functionality, user authentication, and security. 
                  These cannot be disabled.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Analytics Cookies</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Help us understand how users interact with our site to improve performance. 
                  These are anonymized and can be disabled.
                </p>
              </div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm">
                <strong>Cookie Control:</strong> You can manage cookie preferences through your browser settings 
                or our cookie consent banner when you first visit the site.
              </p>
            </div>
          </Card>

          {/* International Users */}
          <Card className="p-8 mb-8 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">International Users</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                WaifuVault serves users worldwide and complies with international privacy regulations including:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• <strong>GDPR</strong> (General Data Protection Regulation) for EU users</li>
                <li>• <strong>CCPA</strong> (California Consumer Privacy Act) for California residents</li>
                <li>• <strong>PIPEDA</strong> (Personal Information Protection and Electronic Documents Act) for Canadian users</li>
                <li>• Other applicable local privacy laws</li>
              </ul>
              <p>
                Data may be processed and stored in various countries where our service providers operate, 
                but always under appropriate data protection safeguards.
              </p>
            </div>
          </Card>

          {/* Data Retention */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <h2 className="text-2xl font-display font-bold mb-6">Data Retention</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 mx-auto mb-3 flex items-center justify-center">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Account Data</h3>
                <p className="text-sm text-muted-foreground">Retained until you delete your account</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 mx-auto mb-3 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Usage Data</h3>
                <p className="text-sm text-muted-foreground">Anonymized after 12 months</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 mx-auto mb-3 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Technical Logs</h3>
                <p className="text-sm text-muted-foreground">Automatically deleted after 30 days</p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-8 border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl font-display font-bold mb-4 text-center">Privacy Questions or Requests?</h2>
            <p className="text-muted-foreground text-center mb-6">
              Contact our Data Protection Officer for any privacy-related questions or to exercise your rights.
            </p>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Privacy Officer:</strong> privacy@waifuvault.com<br />
                <strong>Data Requests:</strong> data-request@waifuvault.com<br />
                <strong>Response Time:</strong> Within 30 days
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;