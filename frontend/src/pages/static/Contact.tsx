import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const DETAILS = [
  { icon: Mail, label: "hello@peonify.com" },
  { icon: Phone, label: "+1 (555) 010-2030" },
  { icon: MapPin, label: "12 Bloom Street, Portland, OR" },
  { icon: Clock, label: "Mon–Sat, 8am – 6pm" },
];

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    subject: "",
    body: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.sendContact(form);
      setSent(true);
      toast.success("Message sent — we'll reply within one business day.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-heading text-5xl font-medium">Contact Us</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Questions about an order, a special event, or anything else — we're
        here to help.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          {DETAILS.map((d) => (
            <div key={d.label} className="flex items-center gap-3 text-sm">
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary">
                <d.icon className="size-4 text-primary" />
              </span>
              {d.label}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {sent ? (
              <div className="py-12 text-center">
                <p className="font-heading text-2xl font-medium">Thank you 🌸</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your message is in our inbox — we'll reply within one business
                  day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name">Name</Label>
                  <Input
                    id="c-name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">Email</Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="c-subject">Subject (optional)</Label>
                  <Input
                    id="c-subject"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Wedding flowers for October"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="c-body">Message</Label>
                  <Textarea
                    id="c-body"
                    rows={5}
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" size="lg" disabled={submitting} className="sm:col-span-2">
                  {submitting ? "Sending…" : "Send Message"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
