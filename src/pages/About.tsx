import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { Heart, Users, Sparkles, Globe, Shield, Zap } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Heart,
      title: "Passion for Anime",
      description: "We're dedicated anime enthusiasts who understand the importance of beautiful waifu artwork in expressing your love for anime culture."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by the community, for the community. Every waifu artwork is shared by fellow anime fans who want to spread the beauty of anime characters."
    },
    {
      icon: Sparkles,
      title: "High Quality",
      description: "We maintain strict quality standards to ensure every waifu artwork meets the expectations of discerning anime fans."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Supporting multiple languages and serving anime fans worldwide, bringing together a diverse community of enthusiasts."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your privacy and security are our top priorities. We implement industry-standard security measures to protect our users."
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "Optimized for speed and reliability, ensuring you can quickly find and download your favorite anime waifu artwork."
    }
  ];

  const team = [
    {
      name: "Development Team",
      role: "Full-Stack Developers",
      description: "Passionate developers who bring technical expertise and anime knowledge together."
    },
    {
      name: "Community Moderators",
      role: "Content Curators",
      description: "Dedicated volunteers who ensure quality content and maintain community standards."
    },
    {
      name: "Design Team",
      role: "UI/UX Designers",
      description: "Creative minds focused on delivering an exceptional user experience."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
              <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 rounded-full gradient-primary items-center justify-center">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-center sm:text-left">
                {t("About Us")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Welcome to Waifu Cloud, your premier destination for beautiful anime waifu artwork. 
              We're passionate about celebrating anime characters and bringing their beauty to life.
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="p-8 mb-12 border-border/50 bg-gradient-to-br from-card to-card/80">
            <h2 className="text-2xl font-display font-bold mb-4 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              To create the world's most comprehensive and user-friendly platform for anime waifu artwork, 
              fostering a global community where fans can discover, share, and celebrate their favorite anime characters.
            </p>
          </Card>

          {/* Features Grid */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-center mb-8">What Makes Us Special</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Our Story */}
          <Card className="p-8 mb-12 border-border/50">
            <h2 className="text-2xl font-display font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                WaifuVault was born from a simple idea: anime fans deserve a dedicated platform 
                where they can find and share high-quality wallpapers that truly capture the essence 
                of their favorite series and characters.
              </p>
              <p>
                Founded by passionate anime enthusiasts, we recognized the need for a platform that 
                goes beyond generic image sharing sites. We wanted to create a space specifically 
                tailored for the anime community, with features and curation that understand what 
                makes anime art special.
              </p>
              <p>
                Today, WaifuVault serves thousands of anime fans worldwide, hosting an ever-growing 
                collection of carefully curated wallpapers. Our community-driven approach ensures 
                that every piece of content meets the high standards our users expect.
              </p>
            </div>
          </Card>

          {/* Team Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="p-6 text-center border-border/50">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Values */}
          <Card className="p-8 border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-primary">Quality First</h3>
                <p className="text-sm text-muted-foreground">
                  We believe in maintaining the highest standards for all content on our platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary">Community Respect</h3>
                <p className="text-sm text-muted-foreground">
                  Every member of our community deserves to be treated with respect and kindness.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary">Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  We continuously improve our platform with new features and technologies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-primary">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  Making anime wallpapers accessible to fans worldwide, regardless of background.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;