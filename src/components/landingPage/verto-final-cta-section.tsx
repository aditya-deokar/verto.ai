"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles } from "lucide-react"
import { ShineBorder } from "../global/ui/shine-border"

export function VertoFinalCtaSection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-red-500/10 to-transparent rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <ShineBorder borderClassName="border border-red-500/20 rounded-3xl">
            <div className="p-12 md:p-16 bg-gradient-to-br from-black/50 via-black/30 to-red-900/10 backdrop-blur-sm rounded-3xl text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl" />

              <div className="relative z-10">
                <motion.div
                  className="mb-8"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30 mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                <motion.h2
                  className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Ready to Transform Your{" "}
                  <span className="verto relative inline-block">
                    Presentations?
                    <motion.div
                      className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    />
                  </span>
                </motion.h2>

                <motion.p
                  className="text-primary/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Join thousands of professionals creating stunning presentations with AI in minutes, not hours.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="mb-8"
                >
                  <ShineBorder className="max-w-2xl mx-auto" borderClassName="border border-white/10 rounded-2xl">
                    <div className="flex flex-col sm:flex-row gap-3 p-3 bg-background/90 backdrop-blur-xl rounded-2xl">
                      <Input
                        placeholder="Enter your email address..."
                        className="border-none bg-transparent text-base outline-hidden focus:outline-hidden focus:ring-0 focus-visible:ring-0 focus:border-transparent shadow-none placeholder:text-primary/30 flex-grow"
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button className="verto-bg hover:opacity-90 gap-2 px-8 h-12 text-base font-semibold shadow-lg shadow-red-500/25 w-full sm:w-auto whitespace-nowrap">
                          Start Free
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.span>
                        </Button>
                      </motion.div>
                    </div>
                  </ShineBorder>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center justify-center gap-4 text-sm text-primary/40"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  {["No credit card required", "3 free presentations", "Cancel anytime"].map((text, i) => (
                    <div key={text} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{text}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </ShineBorder>
        </motion.div>
      </div>
    </section>
  )
}
