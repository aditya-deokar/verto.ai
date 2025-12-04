"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { ShineBorder } from "../global/ui/shine-border"

export function VertoTestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      title: "Marketing Director",
      company: "TechFlow Inc.",
      image: "/placeholder.svg?height=60&width=60",
      quote: "Verto AI saved me at least 5 hours on my last client presentation.",
      fullText:
        "I was skeptical about AI-generated presentations, but Verto AI completely changed my mind. The quality is incredible, and it captures exactly what I want to communicate. It's become an essential part of my workflow.",
    },
    {
      name: "Michael Rodriguez",
      title: "Startup Founder",
      company: "InnovateLab",
      image: "/placeholder.svg?height=60&width=60",
      quote: "Our investor pitch went from good to outstanding thanks to Verto AI.",
      fullText:
        "As a non-designer, I always struggled with making presentations that looked professional. Verto AI not only made my slides beautiful but also helped structure my story in a way that resonated with investors.",
    },
    {
      name: "Dr. Emily Watson",
      title: "Professor",
      company: "Stanford University",
      image: "/placeholder.svg?height=60&width=60",
      quote: "My students are amazed by how quickly I can create engaging lecture materials.",
      fullText:
        "Verto AI has revolutionized how I prepare for classes. I can turn complex research papers into digestible presentations in minutes. My students are more engaged, and I have more time for actual teaching.",
    },
    {
      name: "James Park",
      title: "Consultant",
      company: "Strategy Partners",
      image: "/placeholder.svg?height=60&width=60",
      quote: "Client presentations have never been easier or more impressive.",
      fullText:
        "In consulting, presentation quality can make or break a deal. Verto AI ensures every deck I deliver looks polished and professional, even when I'm working under tight deadlines.",
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
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="py-20 px-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-yellow-500/5 to-transparent rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-orange-500/5 to-transparent rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
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
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-500 border border-yellow-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            ⭐ Testimonials
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Don't Just Take Our{" "}
            <span className="verto relative inline-block">
              Word For It
              <motion.div
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </span>
          </h2>
          <p className="text-primary/50 text-lg max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their presentations.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group"
            >
              <ShineBorder borderClassName="border border-white/5 rounded-2xl h-full group-hover:border-white/10 transition-colors">
                <div className="p-8 h-full min-h-[320px] flex flex-col bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm rounded-2xl relative overflow-hidden">
                  {/* Background gradient on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  
                  {/* Star rating */}
                  <div className="flex gap-1.5 mb-5 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl font-semibold mb-4 text-primary relative z-10 leading-tight">
                    <span className="verto">"</span>{testimonial.quote}<span className="verto">"</span>
                  </blockquote>

                  {/* Full text */}
                  <p className="text-primary/60 mb-6 leading-relaxed flex-grow relative z-10">
                    {testimonial.fullText}
                  </p>

                  {/* Author info */}
                  <motion.div
                    className="flex items-center gap-4 relative z-10"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    {/* Avatar */}
                    <div className="relative w-12 h-12 shrink-0">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 animate-pulse" />
                      <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold verto">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-semibold text-base">{testimonial.name}</div>
                      <div className="text-sm text-primary/50">
                        {testimonial.title} · <span className="text-primary/40">{testimonial.company}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </ShineBorder>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof stats */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-8 px-8 py-4 rounded-2xl bg-white/5 border border-white/10">
            {[
              { value: "50,000+", label: "Happy Users" },
              { value: "4.9/5", label: "Average Rating" },
              { value: "1M+", label: "Presentations Created" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div className="text-2xl md:text-3xl font-bold verto">{stat.value}</div>
                <div className="text-sm text-primary/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
