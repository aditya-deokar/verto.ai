"use client"

import { motion } from "framer-motion"

import { Zap, Palette, ImageIcon, RefreshCw, Brush, Share2 } from "lucide-react"
import { ShineBorder } from "../global/ui/shine-border"

export function VertoFeaturesSection() {
  const features = [
    {
      title: "AI Content Generation",
      benefit: "Beat writer's block and save hours. Go from idea to a full first draft in seconds.",
      icon: <Zap className="w-6 h-6 text-red-500" />,
    },
    {
      title: "Intelligent, Modern Design",
      benefit:
        "Look like a professional designer without the effort. Our AI chooses layouts, fonts, and colors that work.",
      icon: <Palette className="w-6 h-6 text-orange-500" />,
    },
    {
      title: "Royalty-Free Visuals",
      benefit:
        "Bring your story to life. Verto AI automatically finds and inserts relevant, high-quality images and icons.",
      icon: <ImageIcon className="w-6 h-6 text-yellow-500" />,
    },
    {
      title: "Reformat & Repurpose",
      benefit: "Turn any content—a blog post, a PDF, or notes—into a presentation with one click.",
      icon: <RefreshCw className="w-6 h-6 text-red-500" />,
    },
    {
      title: "Brand Consistency",
      benefit:
        "(For Pro users) Apply your own logos, colors, and fonts to every presentation for a consistent brand image.",
      icon: <Brush className="w-6 h-6 text-orange-500" />,
    },
    {
      title: "Easy Editing & Sharing",
      benefit: "Fine-tune with our intuitive editor and share your deck with a single link.",
      icon: <Share2 className="w-6 h-6 text-yellow-500" />,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="py-20 px-6 bg-background/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-red-500/10 to-orange-500/10 text-orange-500 border border-orange-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            ✨ Powerful Features
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            More Than a Tool, It's Your{" "}
            <span className="verto relative inline-block">
              AI Co-Pilot
              <motion.div
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </span>
          </h2>
          <p className="text-primary/50 text-lg max-w-2xl mx-auto">Everything you need to create stunning presentations in minutes.</p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group"
            >
              <ShineBorder borderClassName="border border-white/5 rounded-2xl h-full group-hover:border-white/10 transition-colors">
                <div className="p-8 h-full min-h-[280px] flex flex-col bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm rounded-2xl relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <motion.div
                    className="mb-5 p-3.5 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 w-fit relative z-10"
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-primary/55 leading-relaxed flex-grow relative z-10">{feature.benefit}</p>
                  <motion.div
                    className="mt-4 flex items-center gap-2 text-sm font-medium text-primary/40 group-hover:text-primary/70 transition-colors relative z-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <span>Learn more</span>
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                  </motion.div>
                </div>
              </ShineBorder>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
