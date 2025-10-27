import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { Copyright, Shield, AlertCircle, FileText, Users, Gavel } from "lucide-react";

const CopyrightPolicy = () => {
  const { t } = useTranslation();

  const principles = [
    {
      icon: Shield,
      title: "Respect for Creators",
      description: "We respect the rights of original creators and copyright holders. All content must comply with copyright laws."
    },
    {
      icon: Users,
      title: "Community Responsibility",
      description: "Our community plays a vital role in maintaining copyright compliance by reporting violations and uploading only authorized content."
    },
    {
      icon: FileText,
      title: "Proper Attribution",
      description: "When required, proper attribution must be given to original creators and copyright holders."
    },
    {
      icon: Gavel,
      title: "Legal Compliance",
      description: "We comply with all applicable copyright laws including DMCA and international copyright treaties."
    }
  ];

  const guidelines = [
    {
      title: "What You Can Upload",
      items: [
        "Original artwork created by you",
        "Content you have explicit permission to share",
        "Content under Creative Commons or similar open licenses",
        "Fan art that constitutes fair use (with proper disclaimers)",
        "Public domain content"
      ]
    },
    {
      title: "What You Cannot Upload",
      items: [
        "Copyrighted images without permission",
        "Official anime screenshots or promotional materials",
        "Content from paid sources (magazines, artbooks, etc.)",
        "Watermarked images with watermarks removed",
        "Content that violates trademark rights"
      ]
    }
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
                <Copyright className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-center sm:text-left">
                {t("Copyright Policy")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our commitment to respecting intellectual property rights and supporting creators
            </p>
          </div>

          {/* Policy Statement */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-card to-card/80">
            <h2 className="text-2xl font-display font-bold mb-4">Our Copyright Commitment</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              WaifuVault is committed to respecting the intellectual property rights of creators, artists, 
              and copyright holders. We believe in fostering a creative community while ensuring that all 
              content shared on our platform complies with applicable copyright laws.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Important:</strong> By uploading content to WaifuVault, you confirm that you have 
                  the necessary rights to share that content and that it does not infringe on any third-party copyrights.
                </p>
              </div>
            </div>
          </Card>

          {/* Core Principles */}
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {principles.map((principle, index) => (
                <Card key={index} className="p-6 border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <principle.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{principle.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Upload Guidelines */}
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Upload Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guidelines.map((guideline, index) => (
                <Card key={index} className="p-6 border-border/50">
                  <h3 className={`font-semibold mb-4 ${index === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {guideline.title}
                  </h3>
                  <ul className="space-y-2">
                    {guideline.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className={`h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 ${
                          index === 0 ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          {/* Fair Use */}
          <Card className="p-8 mb-8 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">Fair Use and Fan Art</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We recognize that fan art is an important part of anime culture. Fan art may be protected 
                under fair use provisions in certain jurisdictions, but this is a complex legal area that 
                depends on various factors including:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• The purpose and character of the use (transformative nature)</li>
                <li>• The nature of the copyrighted work</li>
                <li>• The amount and substantiality of the portion used</li>
                <li>• The effect of the use on the market for the original work</li>
              </ul>
              <p>
                When uploading fan art, please ensure it is transformative in nature and includes appropriate 
                disclaimers acknowledging the original creators and copyright holders.
              </p>
            </div>
          </Card>

          {/* Attribution Requirements */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl font-display font-bold mb-6">Attribution Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">When Attribution is Required</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Creative Commons licensed content</li>
                  <li>• Content with specific attribution requirements</li>
                  <li>• Fan art based on existing properties</li>
                  <li>• Modified or derivative works</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">How to Provide Attribution</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Include original creator's name</li>
                  <li>• Mention the source anime/manga series</li>
                  <li>• Add copyright disclaimers when appropriate</li>
                  <li>• Use the description field for detailed attribution</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Reporting Violations */}
          <Card className="p-8 mb-8 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">Reporting Copyright Violations</h2>
            <p className="text-muted-foreground mb-4">
              If you believe that content on WaifuVault infringes your copyright or the copyright of someone 
              you represent, please report it to us. We take copyright violations seriously and will investigate 
              all valid reports.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-primary">For Copyright Holders</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If you are a copyright holder, please file a formal DMCA takedown notice through our 
                  DMCA process page.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-primary">For Community Members</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Community members can report suspected copyright violations through our reporting system 
                  or by contacting our moderation team.
                </p>
              </div>
            </div>
          </Card>

          {/* Consequences */}
          <Card className="p-8 mb-8 border-border/50 bg-gradient-to-br from-red-500/5 to-red-500/10">
            <h2 className="text-2xl font-display font-bold mb-6">Consequences of Violations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-red-600">First Violation</h3>
                <p className="text-sm text-muted-foreground">
                  Content removal and warning notice. User education about copyright policies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Repeat Violations</h3>
                <p className="text-sm text-muted-foreground">
                  Temporary account suspension and mandatory copyright education.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Severe or Persistent Violations</h3>
                <p className="text-sm text-muted-foreground">
                  Permanent account termination and potential legal action.
                </p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-8 border-border/50 bg-gradient-to-br from-card to-card/80">
            <h2 className="text-2xl font-display font-bold mb-4 text-center">Questions About Copyright?</h2>
            <p className="text-muted-foreground text-center mb-6">
              If you have questions about our copyright policy or need clarification about what you can upload, 
              we're here to help.
            </p>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Copyright Questions:</strong> copyright@waifuvault.com<br />
                <strong>DMCA Notices:</strong> dmca@waifuvault.com
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CopyrightPolicy;