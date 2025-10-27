import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "General Questions",
      items: [
        {
          question: "What is Waifu Cloud?",
          answer: "Waifu Cloud is a dedicated platform for anime waifu artwork where fans can discover, upload, and share beautiful anime character art. We focus specifically on anime waifus and provide a curated experience for the anime community."
        },
        {
          question: "Is Waifu Cloud free to use?",
          answer: "Yes! Waifu Cloud is completely free to use. You can browse, search, and download waifu artwork without any cost. Creating an account is also free and gives you access to additional features like uploading and favoriting waifus."
        },
        {
          question: "Do I need an account to download waifu artwork?",
          answer: "No, you can browse and download waifu artwork without creating an account. However, having an account allows you to upload your own waifus, save favorites, and access your personal dashboard."
        },
        {
          question: "What devices are supported?",
          answer: "Our waifu artwork is optimized for various devices including desktop computers, laptops, tablets, and smartphones. We categorize images by orientation (horizontal for desktops, vertical for phones) to help you find the perfect fit."
        }
      ]
    },
    {
      title: "Uploading & Content",
      items: [
        {
          question: "How do I upload waifu artwork?",
          answer: "To upload waifu artwork, you need to create a free account and log in. Then click the 'Upload' button in the header, fill out the required information (character name, series, tags), select your image file, and submit. Your waifu will be reviewed and published if it meets our quality standards."
        },
        {
          question: "What image formats are supported?",
          answer: "We support common image formats including JPEG, PNG, and WebP. For best quality, we recommend uploading high-resolution images (at least 1920x1080 for desktop backgrounds, 1080x1920 for mobile screens)."
        },
        {
          question: "Are there content guidelines?",
          answer: "Yes, we have content guidelines to maintain quality and appropriateness. All content must be anime-related, high-quality, and properly tagged. NSFW content is allowed but must be clearly marked. We do not allow copyrighted material without proper attribution."
        },
        {
          question: "How does the auto-tagging feature work?",
          answer: "Our auto-tagging feature uses AI image recognition and color analysis to suggest relevant tags for your waifu artwork. It analyzes the image content, colors, and character details to generate appropriate tags, making it easier to categorize your uploads."
        }
      ]
    },
    {
      title: "Technical Support",
      items: [
        {
          question: "Why won't my waifu download?",
          answer: "If you're having trouble downloading waifu artwork, try refreshing the page or clearing your browser cache. Make sure you have sufficient storage space on your device. If the problem persists, the image might be temporarily unavailable."
        },
        {
          question: "The website is loading slowly. What can I do?",
          answer: "Slow loading can be caused by various factors. Try refreshing the page, clearing your browser cache, or checking your internet connection. We continuously optimize our servers for better performance."
        },
        {
          question: "How do I change the language?",
          answer: "You can change the language by clicking on any of the language options in the footer. The entire website will be translated to your selected language using our automatic translation system."
        },
        {
          question: "Can I use Waifu Cloud on mobile devices?",
          answer: "Absolutely! Waifu Cloud is fully responsive and works great on mobile devices. You can browse, search, download, and even upload waifu artwork from your smartphone or tablet."
        }
      ]
    },
    {
      title: "Account & Privacy",
      items: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Login' button in the header, then select 'Register' to create a new account. You'll need to provide an email address and create a password. Account creation is free and gives you access to uploading and personal features."
        },
        {
          question: "Is my personal information safe?",
          answer: "Yes, we take privacy seriously. We only collect necessary information for account functionality and never share your personal data with third parties. Read our Privacy Policy for detailed information about data handling."
        },
        {
          question: "How do I delete my account?",
          answer: "You can delete your account by going to your Profile settings and selecting the account deletion option. Please note that this action is irreversible and will remove all your uploaded content and favorites."
        },
        {
          question: "Can I change my username?",
          answer: "Currently, usernames cannot be changed after account creation. If you need to change your username, you would need to create a new account. We're working on adding username change functionality in the future."
        }
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
                <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-center sm:text-left">
                {t("FAQ")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to commonly asked questions about WaifuVault. 
              Can't find what you're looking for? Feel free to reach out to our community.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-display font-bold mb-6 text-primary">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = categoryIndex * 100 + itemIndex;
                    const isOpen = openItems.includes(globalIndex);
                    
                    return (
                      <Card key={itemIndex} className="border-border/50 overflow-hidden">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full p-6 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                        >
                          <h3 className="font-semibold pr-4">{item.question}</h3>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 border-t border-border/50">
                            <p className="text-muted-foreground leading-relaxed pt-4">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-12 p-8 text-center border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl font-display font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              If you couldn't find the answer you were looking for, our community is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Card className="p-4 border-border/50">
                <h3 className="font-semibold mb-2">Community Support</h3>
                <p className="text-sm text-muted-foreground">
                  Join our community discussions and get help from fellow anime fans.
                </p>
              </Card>
              <Card className="p-4 border-border/50">
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Check our detailed guides and tutorials for step-by-step help.
                </p>
              </Card>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;