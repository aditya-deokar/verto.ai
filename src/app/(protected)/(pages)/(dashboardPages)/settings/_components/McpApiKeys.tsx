'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  Key,
  Plus,
  Copy,
  Check,
  Loader2,
  Trash2,
  Ban,
  Clock,
  Shield,
  AlertTriangle,
} from 'lucide-react'
import {
  generateMcpApiKey,
  listMcpApiKeys,
  revokeMcpApiKey,
  deleteMcpApiKey,
  type McpApiKeyInfo,
} from '@/actions/mcp-keys'

export function McpApiKeys() {
  const [keys, setKeys] = useState<McpApiKeyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Create key dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')

  // Reveal dialog (shown after generation)
  const [revealOpen, setRevealOpen] = useState(false)
  const [revealedKey, setRevealedKey] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchKeys = useCallback(async () => {
    const res = await listMcpApiKeys()
    if (res.status === 200 && res.data) {
      setKeys(res.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const handleGenerate = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a name for the key')
      return
    }

    setGenerating(true)
    const res = await generateMcpApiKey(keyName.trim())
    setGenerating(false)

    if (res.status === 200 && res.data) {
      setCreateOpen(false)
      setKeyName('')
      setRevealedKey(res.data.plaintextKey)
      setRevealOpen(true)
      setCopied(false)
      fetchKeys()
    } else {
      toast.error(res.error || 'Failed to generate key')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(revealedKey)
      setCopied(true)
      toast.success('API key copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy — please select and copy manually')
    }
  }

  const handleRevoke = async (keyId: string) => {
    setActionLoading(keyId)
    const res = await revokeMcpApiKey(keyId)
    setActionLoading(null)

    if (res.status === 200) {
      toast.success(res.message || 'Key revoked')
      fetchKeys()
    } else {
      toast.error(res.error || 'Failed to revoke key')
    }
  }

  const handleDelete = async (keyId: string) => {
    setActionLoading(keyId)
    const res = await deleteMcpApiKey(keyId)
    setActionLoading(null)

    if (res.status === 200) {
      toast.success(res.message || 'Key deleted')
      fetchKeys()
    } else {
      toast.error(res.error || 'Failed to delete key')
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">MCP API Keys</CardTitle>
            <CardDescription>
              Generate API keys to connect AI assistants (Claude, Cursor, Antigravity) to your Verto AI account via MCP.
            </CardDescription>
          </div>

          {/* ─── Create Key Dialog ─────────────────────── */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Generate Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate MCP API Key</DialogTitle>
                <DialogDescription>
                  Give your key a name to identify it later (e.g. &quot;Claude Desktop&quot;, &quot;Cursor&quot;).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g. Claude Desktop"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    maxLength={50}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={generating || !keyName.trim()}>
                  {generating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-4">
        {/* ─── Key Reveal Dialog ─────────────────────── */}
        <Dialog open={revealOpen} onOpenChange={setRevealOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                API Key Generated
              </DialogTitle>
              <DialogDescription>
                Copy your API key now. You won&apos;t be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                <code className="flex-1 text-sm font-mono break-all select-all">
                  {revealedKey}
                </code>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="shrink-0">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  This key will only be shown once. Store it securely — if lost, you&apos;ll need to generate a new one.
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setRevealOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── Key List ──────────────────────────────── */}
        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No API Keys</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Generate your first MCP API key to connect AI assistants to Verto AI.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                  key.isRevoked
                    ? 'bg-muted/50 opacity-60'
                    : 'bg-card/50 backdrop-blur-sm hover:bg-card/80'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`p-2 rounded-lg ${
                      key.isRevoked
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-green-500/10 text-green-500'
                    }`}
                  >
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{key.name}</span>
                      {key.isRevoked ? (
                        <Badge variant="destructive" className="text-xs">
                          Revoked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <code className="font-mono">{key.keyPrefix}••••••••</code>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created {formatDate(key.createdAt)}
                      </span>
                      {key.lastUsedAt && (
                        <span>Last used {formatDate(key.lastUsedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-4">
                  {!key.isRevoked && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-amber-600 hover:text-amber-600 hover:bg-amber-500/10"
                          disabled={actionLoading === key.id}
                        >
                          {actionLoading === key.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will immediately disable the key &quot;{key.name}&quot;. Any MCP clients using this key will lose access. You can delete it later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRevoke(key.id)}>
                            Revoke Key
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={actionLoading === key.id}
                      >
                        {actionLoading === key.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Permanently delete the key &quot;{key.name}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(key.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Usage Instructions ─────────────────────── */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl border text-sm space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            How to use your API key
          </h4>
          <p className="text-muted-foreground">
            Set the <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">VERTO_API_KEY</code> environment variable in your MCP client config, or pass it as a Bearer token in the Authorization header for HTTP transport.
          </p>
          <pre className="p-3 bg-background rounded-lg border text-xs font-mono overflow-x-auto whitespace-pre">
{`// Claude Desktop / Cursor config
{
  "mcpServers": {
    "verto-ai": {
      "command": "npx",
      "args": ["tsx", "src/mcp/transport/stdio.ts"],
      "env": { "VERTO_API_KEY": "vk_live_..." }
    }
  }
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
