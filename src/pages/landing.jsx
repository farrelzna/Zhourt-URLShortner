import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Aurora from '@/components/Aurora';
import { ArrowRight, Link2, BarChart3, Shield, Zap, Star, Github, Twitter, Linkedin, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const [longUrl, setLongUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const cardsContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const dragSectionRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const dragStartY = useRef(0);
  const dragInitialY = useRef(0);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      navigate(`/auth?createNew=${encodeURIComponent(longUrl)}`);
      setIsLoading(false);
    }, 500);
  };

  // Toggle content visibility
  const toggleContent = () => {
    setIsFirstLoad(false);
    setIsContentVisible(!isContentVisible);

    // Animate the section position
    if (isContentVisible) {
      // When closing, always reset to initial position (0)
      setDragY(0);
      // Disable scroll immediately
      document.body.style.overflow = 'hidden';
    } else {
      // When opening, move to half screen
      setDragY(-window.innerHeight * 0.5);
      // Enable scroll after animation
      setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 400);
    }
  };

  // Initialize page state
  useEffect(() => {
    // Initially hide content and disable scroll
    document.body.style.overflow = 'hidden';
    setDragY(0);

    // Animate toggle button entrance
    if (toggleButtonRef.current) {
      gsap.fromTo(toggleButtonRef.current,
        { y: 50, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          delay: 1,
          ease: "back.out(1.7)"
        }
      );

      // Add bounce animation
      gsap.to(toggleButtonRef.current, {
        y: -10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 2
      });
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const features = [
    {
      icon: Link2,
      title: "Instant Shortening",
      description: "Transform long URLs into clean, shareable links in seconds",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Track clicks, locations, and engagement with comprehensive insights",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with global CDN and instant redirects",
      color: "from-orange-500 to-red-500"
    }
  ];

  // Duplicate features untuk looping 2x
  const duplicatedFeatures = [...features, ...features];

  useEffect(() => {
    if (!isContentVisible) return;

    const setupScrollAnimation = () => {
      const container = scrollContainerRef.current;
      const cardsContainer = cardsContainerRef.current;
      if (!container || !cardsContainer) return;

      // Horizontal scroll animation
      const cards = cardsContainer.children;
      const cardWidth = 320; // width + gap
      const totalWidth = cardWidth * features.length;
      gsap.set(cardsContainer, { width: totalWidth * 2 });

      // Heavy/Slow horizontal scroll trigger
      ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 3,
        ease: "power2.out",
        onUpdate: (self) => {
          const progress = self.progress;
          const dampenedProgress = Math.pow(progress, 1.5);
          gsap.to(cardsContainer, {
            x: -totalWidth * dampenedProgress,
            duration: 0.5,
            ease: "power2.out"
          });
        }
      });

      // Add momentum/inertia effect
      ScrollTrigger.create({
        trigger: container,
        start: "top center",
        end: "bottom center",
        scrub: 5,
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          gsap.to(cardsContainer.children, {
            rotationY: velocity * 0.01,
            duration: 0.8,
            ease: "power2.out"
          });
        }
      });

      // Card animations
      gsap.fromTo(cards,
        {
          y: 100,
          opacity: 0,
          rotationX: -15,
          scale: 0.8,
        },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      Array.from(cards).forEach((card, index) => {
        gsap.to(card, {
          y: -10,
          duration: 2 + index * 0.2,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        });
      });
    };

    const timer = setTimeout(setupScrollAnimation, 100);
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [features.length, isContentVisible]);

  // Drag logic for features section (only when content is visible)
  useEffect(() => {
    if (!isContentVisible) return;

    const section = dragSectionRef.current;
    if (!section) return;

    const handleMouseDown = (e) => {
      setIsDragging(true);
      dragStartY.current = e.clientY;
      dragInitialY.current = dragY;
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      let newY = dragInitialY.current + (e.clientY - dragStartY.current);
      // Clamp so can't drag below initial position or above footer
      newY = Math.max(newY, -window.innerHeight * 0.7);
      newY = Math.min(newY, -window.innerHeight * 0.1);
      setDragY(newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    section.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events
    section.addEventListener('touchstart', (e) => {
      setIsDragging(true);
      dragStartY.current = e.touches[0].clientY;
      dragInitialY.current = dragY;
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      let newY = dragInitialY.current + (e.touches[0].clientY - dragStartY.current);
      newY = Math.max(newY, -window.innerHeight * 0.7);
      newY = Math.min(newY, -window.innerHeight * 0.1);
      setDragY(newY);
    });

    window.addEventListener('touchend', () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    });

    return () => {
      section.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      section.removeEventListener('touchstart', () => { });
      window.removeEventListener('touchmove', () => { });
      window.removeEventListener('touchend', () => { });
    };
  }, [dragY, isDragging, isContentVisible]);

  const stats = [
    { label: "Links Created", value: "1M+" },
    { label: "Active Users", value: "50K+" },
    { label: "Uptime", value: "99.9%" }
  ];

  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      console.log("Newsletter signup:", email);
      setEmail("");
    }
  };

  const navigationLinks = {
    "Zhourt": [
      { name: "Blog", href: "#" },
      { name: "Showcase", href: "#" },
      { name: "Learn Zhourt", href: "#" },
      { name: "API Docs", href: "#" },
      { name: "Contact Us", href: "#" }
    ],
    "Connect": [
      { name: "Forums", href: "#" },
      { name: "Codepen", href: "#" },
      { name: "LinkedIn", href: "#" },
      { name: "Bluesky", href: "#" },
      { name: "GitHub", href: "#" },
      { name: "X", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: MessageSquare, href: "#", label: "Forums" }
  ];

  return (
    <div className="relative" style={{ minHeight: isContentVisible ? '200vh' : '150vh' }}>
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* Hero Section (sticky) */}
      <section className="sticky top-0 z-20 bg-transparent">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-start">
            {/* Badge */}
            <Badge variant="secondary" className="mb-8 bg-white/20 dark:bg-gray-800/50 backdrop-blur-xl text-gray-300 border-0">
              <Star className="w-3 h-3 mr-2" />
              Trusted by thousands worldwide
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal font-mono text-white mb-6">
              <span className="bg-black relative w-50 h-20 inline-block"><span className="absolute top-4">Zhourt</span></span>  -The only URL shortener
              <br />
              <span className="">you'll ever need</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs text-white mb-14 max-w-xl">
              Clean, fast, and reliable URL shortening with powerful analytics.
              Perfect for businesses, marketers, and individuals.
            </p>

            {/* URL Shortener Form */}
            <div className="max-w-2xl mb-16">
              <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-3 p-1 backdrop-blur-sm rounded-2xl border border-white/50">
                <Input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="Enter your looong URL here..."
                  className="flex-1 h-12 px-4 bg-transparent border-0 text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0"
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading || !longUrl.trim()}
                  className="h-12 px-6 bg-transparent hover:bg-black hover:text-white text-white rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Shortening...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Shorten
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-3">
                No registration required - just login • Free forever
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-medium text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle Button - Position changes based on content state */}
        <div
          className={`fixed left-1/2 transform -translate-x-1/2 z-30 transition-all duration-500 ease-in-out ${isContentVisible
            ? 'top-8' // Move to top when content is open
            : 'bottom-8' // Stay at bottom when content is closed
            }`}
        >
          <button
            ref={toggleButtonRef}
            onClick={toggleContent}
            className="w-16 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 group relative overflow-hidden"
            aria-label={isContentVisible ? "Hide content" : "Show content"}
          >
            {/* SVG Icons with smooth rotation transition */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <ChevronUp
                className={`absolute w-8 h-8 text-white transition-all duration-500 transform ${isContentVisible
                  ? 'opacity-0 rotate-180 scale-75'
                  : 'opacity-100 rotate-0 scale-100'
                  } group-hover:scale-110`}
              />
              <ChevronDown
                className={`absolute w-8 h-8 text-white transition-all duration-500 transform ${isContentVisible
                  ? 'opacity-100 rotate-0 scale-100'
                  : 'opacity-0 rotate-180 scale-75'
                  } group-hover:scale-110`}
              />
            </div>

            {/* Enhanced ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-150 transition-transform duration-500"></div>

            {/* Pulsating outer glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>

            {/* Additional animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10 scale-100 group-hover:scale-125 transition-transform duration-300"></div>
          </button>
        </div>
      </section>

      {/* Main Content Section (draggable, includes features, CTA, and footer) */}
      <section
        ref={el => { scrollContainerRef.current = el; dragSectionRef.current = el; }}
        className={`absolute top-[100vh] rounded-t-4xl left-0 right-0 pt-30 bg-white dark:bg-gray-900 z-20 overflow-hidden ${isContentVisible ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',        
          visibility: isFirstLoad && !isContentVisible ? 'hidden' : 'visible'
        }}
        aria-label="Drag to move main content section"
      >
        <div className="mx-auto h-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 dark:text-white mb-4">
              Why choose Zhourt?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              Built for modern teams and individuals who need reliable, fast, and secure URL shortening
            </p>
            <div className="text-start px-20 text-black/70 dark:text-gray-300 leading-relaxed">
              <ScrollReveal
                baseOpacity={0}
                enableBlur={true}
                baseRotation={5}
                blurStrength={10}
              >
                Zhourt is a modern web application for instantly shortening links (URLs) — completely free and unlimited. With Zhourt, you can turn long URLs into short, shareable links and get real-time click analytics. Unlike other services that restrict free features, Zhourt gives you all the essentials with no cost, no ads, and no mandatory registration. Perfect for businesses, creators, and personal use.
                What makes it different? Zhourt is truly free forever: no monthly limits, no watermarks, no hidden catches. Use it instantly, share your links, and track stats without worrying about fees or privacy. This is the transparent, fast, and user-friendly link shortener for everyone.
              </ScrollReveal>
              {/* CTA Section */}
              <div className="w-full items-center justify-start mb-24">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r bg-black/90 hover:bg-black/80 text-white px-10 py-3 text-sm rounded-sm transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start for free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  No credit card required • Set up in 30 seconds
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal Scrolling Cards Container */}
          <div className="my-24">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 dark:text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                Everything you need to shorten, share, and track your links
              </p>
            </div>
            <div className="relative w-full h-120 overflow-hidden">
              <div
                ref={cardsContainerRef}
                className="flex gap-8 absolute top-10"
                style={{ height: '100%' }}
              >
                {duplicatedFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-80 h-80 perspective-1000"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Card className="w-full h-full border-none shadow-none bg-white transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden group">
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}></div>

                      {/* Animated Border */}
                      {/* <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div> */}

                      <CardContent className="p-8 text-center h-full flex flex-col justify-center relative z-10">
                        {/* Icon with 3D effect */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transform transition-all duration-700 group-hover:rotate-y-12 group-hover:scale-110">
                          <feature.icon className="w-10 h-10 text-gray-700 dark:text-gray-300 transition-all duration-700 group-hover:scale-125" />

                          {/* Icon glow effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-xl`}></div>
                        </div>

                        {/* Title with animation */}
                        <h3 className="text-xl font-norma;  text-gray-900 dark:text-white mb-4 transition-all duration-700 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                          {feature.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-all duration-700 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                          {feature.description}
                        </p>

                        {/* Floating particles effect */}
                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping"></div>
                        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-900 animate-pulse"></div>
                        <div className="absolute top-1/2 left-4 w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-800 animate-bounce"></div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <footer id="footer" className="w-full bg-black/90 border-gray-200 dark:border-gray-700 rounded-t-2xl z-30 relative overflow-hidden group">
            <div className="mx-auto sm:px-6 lg:px-8 py-16">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
                {/* Newsletter Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 relative overflow-hidden group">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-medium text-black/90 mb-3">
                        Keep in the loop with the Zhourt® newsletter.
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                        Get the latest updates on new features, tips, and industry insights.
                      </p>
                      <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="h-12 pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                            required
                          />
                          <Button
                            type="submit"
                            size="sm"
                            className="absolute right-2 top-2 h-8 w-8 p-0 bg-black/90 hover:bg-black/80 rounded-lg"
                          >
                            <ArrowRight className="w-4 h-4 text-white dark:text-gray-900" />
                          </Button>
                        </div>
                      </form>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        No spam, unsubscribe at any time.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-65 -right-20 transform">
                  <h3 className="text-6xl font-medium  text-white/10 hover:text-white duration-700 -rotate-90 mb-3">
                    ZhourtUrl
                  </h3>
                </div>
                {/* Navigation Links */}
                {Object.entries(navigationLinks).map(([title, links]) => (
                  <div key={title} className="">
                    <h4 className="text-lg font-semibold text-white mb-6">
                      {title}
                    </h4>
                    <ul className="space-y-4">
                      {links.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link.href}
                            className="ext-gray-400 hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {/* Bottom Section */}
              <div className="">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  {/* Copyright and Legal */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-white">
                    <p>
                      ©2025 Zhourt – A URL Shortener Product. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                      <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                        Privacy Policy
                      </a>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <a href="#" className="hover:text-gray-300 transition-colors duration-200">
                        Terms of Use
                      </a>
                    </div>
                  </div>
                  {/* Social Links */}
                  <div className="flex items-center gap-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        aria-label={social.label}
                        className="w-10 h-10 bg-black/80 hover:bg-black/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                      >
                        <social.icon className="w-5 h-5 text-white" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
            </div>
          </footer>
        </div>
      </section >
    </div >
  );
};

export default LandingPage;