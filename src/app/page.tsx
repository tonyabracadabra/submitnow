"use client";

import { useTransition } from "react";
import { submitUrls } from "@/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import useLocalStorage from "@/hooks/use-local-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Rocket, Shield, Zap } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  host: z.string().min(1, "Host is required"),
  indexnowKey: z.string().min(1, "IndexNow key is required"),
  googleApiKey: z.object({
    type: z.literal("service_account"),
    project_id: z.string(),
    private_key_id: z.string(),
    private_key: z.string(),
    client_email: z.string().email(),
    client_id: z.string(),
    auth_uri: z.string().url(),
    token_uri: z.string().url(),
    auth_provider_x509_cert_url: z.string().url(),
    client_x509_cert_url: z.string().url(),
    universe_domain: z.string(),
  }),
  urls: z.string().min(1, "At least one URL is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function SubmitPage() {
  const [host, setHost] = useLocalStorage<string>("host", "");
  const [indexnowKey, setIndexnowKey] = useLocalStorage<string>("indexnowKey", "");
  const [apiKey, setApiKey] = useLocalStorage<string>("apiKey", "");
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host,
      indexnowKey,
      googleApiKey: JSON.parse(apiKey || "{}"),
      urls: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    startTransition(async () => {
      try {
        const urlList = data.urls
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean);
        const result = await submitUrls({
          host: data.host,
          indexnowKey: data.indexnowKey,
          urlList,
          googleApiKey: JSON.stringify(data.googleApiKey),
        });
        if (result.success) {
          toast.success(result.message);
          setHost(data.host);
          setIndexnowKey(data.indexnowKey);
          setApiKey(JSON.stringify(data.googleApiKey));
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An error occurred while submitting URLs");
      }
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                Submit URLs to IndexNow and Google
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter host (e.g., example.com)" className="w-full" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="indexnowKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IndexNow Key</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your IndexNow key" className="w-full" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="googleApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Indexing API Key</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter Google Indexing API key (JSON)"
                            rows={10}
                            className="w-full"
                            onChange={(e) => {
                              try {
                                const parsedValue = JSON.parse(e.target.value);
                                field.onChange(parsedValue);
                              } catch (error) {
                                field.onChange(e.target.value);
                              }
                            }}
                            value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URLs</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter one URL per line (e.g., /blog/post-1 or https://example.com/blog/post-1)" rows={10} className="w-full" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <Rocket className="text-blue-500 size-6" />
                  <span>Rapid URL submission to IndexNow and Google&apos;s Indexing API</span>
                </li>
                <li className="flex items-center gap-4">
                  <Zap className="text-yellow-500 size-4" />
                  <span>Powerful bulk URL submission capability</span>
                </li>
                <li className="flex items-center gap-4">
                  <Shield className="text-green-500 size-6" />
                  <span>Privacy-focused: We don&apos;t store your sensitive information</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Configuration Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="indexnow" className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="indexnow">IndexNow</TabsTrigger>
                  <TabsTrigger value="google">Google</TabsTrigger>
                </TabsList>
                <TabsContent value="indexnow">
                  <AlertTitle>IndexNow Configuration</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                      <li><strong>Host:</strong> Enter your website&apos;s domain (e.g., example.com).</li>
                      <li><strong>IndexNow Key:</strong> Create a unique key for IndexNow (e.g., your-unique-key).</li>
                      <li><strong>IndexNow Setup:</strong> Create a file named <code>[your-key].txt</code> (e.g., your-unique-key.txt) containing only your key, and upload it to your website&apos;s root folder (e.g., https://example.com/your-unique-key.txt).</li>
                    </ol>
                  </AlertDescription>
                </TabsContent>
                <TabsContent value="google">
                  <AlertDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                      <li><strong>API Key:</strong> Enter your Google Indexing API key (JSON format).</li>
                      <li><strong>Google Search Console:</strong> Set up your website in Google Search Console to track indexing and search performance. <a href="https://www.dannyhines.io/blog/vercel-website-gsc" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Learn how to register your website</a>.</li>
                    </ol>
                  </AlertDescription>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
