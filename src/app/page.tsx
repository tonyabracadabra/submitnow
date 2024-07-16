"use client";

import { useState, useTransition } from "react";
import { submitUrls } from "@/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import useLocalStorage from "@/hooks/use-local-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface FormData {
  host: string;
  key: string;
  apiKey: string;
  urls: string;
}

export default function SubmitPage() {
  const [host, setHost] = useLocalStorage<string>("host", "");
  const [key, setKey] = useLocalStorage<string>("key", "");
  const [apiKey, setApiKey] = useLocalStorage<string>("apiKey", "");
  const [response, setResponse] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    defaultValues: {
      host,
      key,
      apiKey,
      urls: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    startTransition(async () => {
      const urlList = data.urls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url);
      const result = await submitUrls({ host: data.host, key: data.key, urlList, apiKey: data.apiKey });
      setResponse(result.message);
      setHost(data.host);
      setKey(data.key);
      setApiKey(data.apiKey);
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Submit URLs to IndexNow and Google
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Configuration Instructions</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li><strong>Host:</strong> Enter your website&apos;s domain (e.g., example.com).</li>
                <li><strong>Key:</strong> Create a unique key for IndexNow (e.g., your-unique-key).</li>
                <li><strong>IndexNow Setup:</strong> Create a file named <code>[your-key].txt</code> (e.g., your-unique-key.txt) containing only your key, and upload it to your website&apos;s root folder (e.g., https://example.com/your-unique-key.txt).</li>
                <li><strong>API Key:</strong> Enter your Google Indexing API key (JSON format).</li>
                <li><strong>URLs:</strong> Enter the URLs you want to submit, one per line.</li>
                <li><strong>Google Search Console:</strong> Set up your website in Google Search Console to track indexing and search performance. <a href="https://www.dannyhines.io/blog/vercel-website-gsc" target="_blank" rel="noopener noreferrer">Learn how to register your website</a>.</li>
              </ol>
            </AlertDescription>
          </Alert>
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
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your IndexNow key" className="w-full" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Indexing API Key</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Google Indexing API key (JSON)" type="password" className="w-full" />
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
                      <Textarea {...field} placeholder="Enter one URL per line" rows={10} className="w-full" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
          {response && (
            <Alert className="mt-6" variant="default">
              <AlertTitle>Submission Result</AlertTitle>
              <AlertDescription>{response}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <Alert className="mt-4">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Additional Information</AlertTitle>
        <AlertDescription>
          <p>To set up @Web for your website, follow these steps:</p>
          <ol className="list-decimal list-inside space-y-2 mt-2">
            <li>Go to your website&apos;s root directory</li>
            <li>Create a file named <code>.well-known/atproto-did</code></li>
            <li>Add your website&apos;s DID in the file</li>
          </ol>
          <p className="mt-2">For more detailed instructions, refer to the <a href="https://atproto.com/specs/did-web" target="_blank" rel="noopener noreferrer">official @Web DID specification</a>.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
