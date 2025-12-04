"use client"

import { motion } from "framer-motion"
import { Lightbulb, Brain, CheckCircle } from "lucide-react"
import { ShineBorder } from "../global/ui/shine-border"

export function VertoHowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Spark the Idea",
      description:
        "Start with a single topic, a detailed prompt, or even a messy document. Tell Verto AI what you want to communicate.",
      icon: <Lightbulb className="w-8 h-8 text-red-500" />,
    },
    {
      number: "02",
      title: "Let AI Work Its Magic",
      description:
        "Our AI outlines your story, writes compelling content for each slide, and applies modern, professional design with relevant visuals.",
      icon: <Brain className="w-8 h-8 text-orange-500" />,
    },
    {
      number: "03",
      title: "Present and Polish",
      description:
        "In seconds, you get a complete deck ready to go. Easily edit any text, swap images, or fine-tune the design to make it perfectly yours.",
      icon: <CheckCircle className="w-8 h-8 text-yellow-500" />,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-radial from-red-500/5 to-transparent rounded-full blur-3xl"
          animate={{ x: [-100, 100, -100], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
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
          >
            🚀 How It Works
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Create a Polished Deck in{" "}
            <span className="verto relative inline-block">
              3 Simple Steps
              <motion.div
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </span>
          </h2>
          <p className="text-primary/50 text-lg max-w-2xl mx-auto">From idea to professional presentation in under a minute.</p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative group"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden md:block absolute top-20 -right-3 w-6 h-[2px] bg-gradient-to-r from-red-500 to-orange-500 z-10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.5 }}
                />
              )}
              
              <ShineBorder borderClassName="border border-white/5 rounded-2xl h-full group-hover:border-white/10 transition-colors">
                <div className="p-8 h-full min-h-[340px] flex flex-col bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <motion.div
                    className="text-7xl font-bold bg-gradient-to-br from-red-500 to-orange-500 bg-clip-text text-transparent mb-6 relative z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    {step.number}
                  </motion.div>
                  <motion.div
                    className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 w-fit shadow-lg shadow-red-500/20 relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-white">{step.icon}</div>
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4 relative z-10">{step.title}</h3>
                  <p className="text-primary/55 leading-relaxed flex-grow relative z-10">{step.description}</p>
                </div>
              </ShineBorder>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
