import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import { Mail, MessageCircle, Shield, HelpCircle, AlertTriangle, Clock } from "lucide-react";

const Contact = () => {
  const { t } = useTranslation();

  const contactMethods = [
    {
      icon: Mail,
      title: "General Inquiries",
      description: "For general questions, feedback, or support requests",
      email: "waifucloud@proton.me",
      responseTime: "24-48 hours"
    },
    {
      icon: Shield,
      title: "DMCA & Copyright",
      description: "For copyright infringement claims and DMCA takedown notices",
      email: "waifucloud@proton.me",
      responseTime: "24 hours"
    },
    {
      icon: AlertTriangle,
      title: "Report Content",
      description: "Report inappropriate content or policy violations",
      email: "waifucloud@proton.me",
      responseTime: "12-24 hours"
    },
    {
      icon: HelpCircle,
      title: "Technical Support",
      description: "Technical issues, bugs, or account problems",
      email: "waifucloud@proton.me",
      responseTime: "24-48 hours"
    }
  ];

  const faqTopics = [
    {
      title: "Account Issues",
      items: [
        "Login problems",
        "Password reset",
        "Account deletion",
        "Profile settings"
      ]
    },
    {
      title: "Upload Problems",
      items: [
        "Image upload failures",
        "File format issues",
        "Content guidelines",
        "Tagging help"
      ]
    },
    {
      title: "Content Issues",
      items: [
        "Copyright concerns",
        "Inappropriate content",
        "Missing wallpapers",
        "Quality issues"
      ]
    },
    {
      title: "Technical Issues",
      items: [
        "Site loading problems",
        "Download issues",
        "Mobile compatibility",
        "Browser compatibility"
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
                <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-center sm:text-left">
                {t("Contact Us")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get in touch with our team. We're here to help with any questions, 
              concerns, or feedback you may have about Waifu Cloud.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <Card key={index} className="p-6 border-border/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <method.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{method.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{method.responseTime}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {method.description}
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = `mailto:${method.email}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {method.email}
                </Button>
              </Card>
            ))}
          </div>

          {/* Quick Help Section */}
          <Card className="p-8 mb-12 border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">Before You Contact Us</h2>
            <p className="text-muted-foreground text-center mb-6">
              Check if your question is already answered in our FAQ or help documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="/faq">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Visit FAQ
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/about">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  About Us
                </a>
              </Button>
            </div>
          </Card>

          {/* Common Topics */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Common Contact Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {faqTopics.map((topic, index) => (
                <Card key={index} className="p-6 border-border/50">
                  <h3 className="font-semibold mb-4 text-primary">{topic.title}</h3>
                  <ul className="space-y-2">
                    {topic.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          {/* Response Time Notice */}
          <Card className="p-8 border-border/50 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <div className="text-center">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold mb-4">Response Times</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold text-green-700 mb-2">Urgent Issues</h3>
                  <p className="text-muted-foreground">Security, DMCA, or critical bugs</p>
                  <p className="font-medium">12-24 hours</p>
                </div>
                <div>
                  <h3 className="font-semibold text-green-700 mb-2">General Support</h3>
                  <p className="text-muted-foreground">Account help, technical questions</p>
                  <p className="font-medium">24-48 hours</p>
                </div>
                <div>
                  <h3 className="font-semibold text-green-700 mb-2">Feature Requests</h3>
                  <p className="text-muted-foreground">Suggestions and feedback</p>
                  <p className="font-medium">48-72 hours</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                We aim to respond to all emails within the timeframes above. 
                During peak periods, responses may take slightly longer.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;