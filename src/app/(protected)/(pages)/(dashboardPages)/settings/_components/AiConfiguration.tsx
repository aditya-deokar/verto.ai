'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckCircle2, Circle, Key, Loader2, Trash2, Zap } from 'lucide-react'
import { AiProvider } from '@/generated/prisma'
import { saveUserAiKey, deleteUserAiKey, getUserAiKeysStatus, testAiKeyConnection } from '@/actions/ai-keys'

export function AiConfiguration() {
  const [keysStatus, setKeysStatus] = useState<{google: boolean, openai: boolean, groq: boolean}>({
    google: false,
    openai: false,
    groq: false
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<AiProvider | null>(null)
  const [testing, setTesting] = useState<AiProvider | null>(null)

  const [inputKeys, setInputKeys] = useState({
    google: '',
    openai: '',
    groq: ''
  })

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    const res = await getUserAiKeysStatus()
    if (res.status === 200 && res.data) {
      setKeysStatus(res.data)
    }
    setLoading(false)
  }

  const handleSave = async (provider: AiProvider) => {
    const key = inputKeys[provider.toLowerCase() as keyof typeof inputKeys]
    if (!key) {
      toast.error(`Please enter a key for ${provider}`)
      return
    }

    setUpdating(provider)
    const res = await saveUserAiKey(provider, key)
    setUpdating(null)

    if (res.status === 200) {
      toast.success(res.message || "API key saved successfully")
      setInputKeys({ ...inputKeys, [provider.toLowerCase()]: '' })
      fetchStatus()
    } else {
      toast.error(res.error || "Failed to save key")
    }
  }

  const handleDelete = async (provider: AiProvider) => {
    if (!confirm(`Are you sure you want to remove your ${provider} API key?`)) return

    setUpdating(provider)
    const res = await deleteUserAiKey(provider)
    setUpdating(null)

    if (res.status === 200) {
      toast.success(res.message || "API key deleted successfully")
      fetchStatus()
    } else {
      toast.error(res.error || "Failed to delete key")
    }
  }

  const handleTest = async (provider: AiProvider) => {
    const key = inputKeys[provider.toLowerCase() as keyof typeof inputKeys]
    if (!key) {
      toast.error(`Please enter a key to test ${provider}`)
      return
    }

    setTesting(provider)
    const res = await testAiKeyConnection(provider, key)
    setTesting(null)

    if (res.status === 200) {
      toast.success(res.message || "Connection successful!")
    } else {
      toast.error(res.error || "Connection test failed")
    }
  }

  const ProviderCard = ({ title, provider, description, isConfigured }: { title: string, provider: AiProvider, description: string, isConfigured: boolean }) => (
    <div className="space-y-4 p-4 border rounded-xl bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConfigured ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
            {isConfigured ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {isConfigured && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(provider)}
            disabled={updating === provider}
          >
            {updating === provider ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Input 
            type="password" 
            placeholder={isConfigured ? "••••••••••••••••" : `Enter your ${title} API Key`}
            className="pr-10"
            value={inputKeys[provider.toLowerCase() as keyof typeof inputKeys]}
            onChange={(e) => setInputKeys({ ...inputKeys, [provider.toLowerCase()]: e.target.value })}
          />
          <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleTest(provider)}
            disabled={testing === provider || !inputKeys[provider.toLowerCase() as keyof typeof inputKeys]}
          >
            {testing === provider ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            Test
          </Button>
          <Button 
            className="flex-1"
            onClick={() => handleSave(provider)}
            disabled={updating === provider || !inputKeys[provider.toLowerCase() as keyof typeof inputKeys]}
          >
            {updating === provider ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isConfigured ? 'Update Key' : 'Save Key'}
          </Button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">AI Model Configuration</CardTitle>
        <CardDescription>
          Bring your own API keys to use specific models. If no key is provided, the system will use the default Google Gemini key.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProviderCard 
            title="Google Gemini" 
            provider={AiProvider.GOOGLE} 
            description="Access Gemini 1.5 & 2.0 models"
            isConfigured={keysStatus.google}
          />
          <ProviderCard 
            title="OpenAI" 
            provider={AiProvider.OPENAI} 
            description="Access GPT-4o and GPT-4o-mini"
            isConfigured={keysStatus.openai}
          />
          <ProviderCard 
            title="Groq" 
            provider={AiProvider.GROQ} 
            description="Access Llama 3 & Mixtral models"
            isConfigured={keysStatus.groq}
          />
        </div>
      </CardContent>
    </Card>
  )
}
