import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  TextField,
  Select,
  Checkbox,
  ProgressBar,
  Banner,
  Divider
} from "@shopify/polaris";
import { useState } from "react";
import { prisma } from "../lib/prisma.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  return json({
    shop,
    step: 1,
    totalSteps: 4
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const step = formData.get("step") as string;
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return json({ 
      error: "Shop-Parameter fehlt",
      success: false 
    });
  }
  
  if (step === "4") {
    try {
      // Setup abgeschlossen - Onboarding als completed markieren
      await prisma.shop.update({
        where: { shopDomain: shop },
        data: {
          onboardingCompleted: true,
          onboardingStep: 'completed',
          lastActiveAt: new Date()
        }
      });
      
      console.log(`✅ Onboarding completed for shop: ${shop}`);
      return redirect(`/dashboard?shop=${shop}`);
      
    } catch (error) {
      console.error("❌ Failed to complete onboarding:", error);
      return json({ 
        error: "Fehler beim Abschließen des Setups",
        success: false 
      });
    }
  }
  
  if (step === "1") {
    try {
      // Geschäftsinformationen speichern
      const businessName = formData.get("businessName") as string;
      const businessType = formData.get("businessType") as string;
      const targetAudience = formData.get("targetAudience") as string;
      
      // App-Settings als JSON speichern
      const currentShop = await prisma.shop.findUnique({
        where: { shopDomain: shop },
        select: { appSettings: true }
      });
      
      const currentSettings = currentShop?.appSettings 
        ? JSON.parse(currentShop.appSettings) 
        : {};
      
      const updatedSettings = {
        ...currentSettings,
        business: {
          name: businessName?.trim(),
          type: businessType,
          targetAudience: targetAudience?.trim()
        }
      };
      
      await prisma.shop.update({
        where: { shopDomain: shop },
        data: {
          appSettings: JSON.stringify(updatedSettings),
          onboardingStep: 'business_completed',
          lastActiveAt: new Date()
        }
      });
      
      console.log(`✅ Business info saved for shop: ${shop}`);
      
    } catch (error) {
      console.error("❌ Failed to save business info:", error);
      return json({ 
        error: "Fehler beim Speichern der Geschäftsinformationen",
        success: false 
      });
    }
  }
  
  // Weitere Schritte können hier ergänzt werden
  if (step === "2") {
    try {
      // App-Design Daten speichern
      const appName = formData.get("appName") as string;
      const appDescription = formData.get("appDescription") as string;
      const primaryColor = formData.get("primaryColor") as string;
      
      const currentShop = await prisma.shop.findUnique({
        where: { shopDomain: shop },
        select: { appSettings: true }
      });
      
      const currentSettings = currentShop?.appSettings 
        ? JSON.parse(currentShop.appSettings) 
        : {};
      
      const updatedSettings = {
        ...currentSettings,
        design: {
          appName: appName?.trim(),
          appDescription: appDescription?.trim(),
          primaryColor: primaryColor
        }
      };
      
      await prisma.shop.update({
        where: { shopDomain: shop },
        data: {
          appSettings: JSON.stringify(updatedSettings),
          onboardingStep: 'design_completed',
          lastActiveAt: new Date()
        }
      });
      
      console.log(`✅ Design settings saved for shop: ${shop}`);
      
    } catch (error) {
      console.error("❌ Failed to save design settings:", error);
      return json({ 
        error: "Fehler beim Speichern der Design-Einstellungen",
        success: false 
      });
    }
  }
  
  if (step === "3") {
    try {
      // Feature-Auswahl speichern
      const features = {
        pushNotifications: formData.get("pushNotifications") === "on",
        loyaltyProgram: formData.get("loyaltyProgram") === "on",
        socialSharing: formData.get("socialSharing") === "on",
        offlineMode: formData.get("offlineMode") === "on"
      };
      
      const currentShop = await prisma.shop.findUnique({
        where: { shopDomain: shop },
        select: { appSettings: true }
      });
      
      const currentSettings = currentShop?.appSettings 
        ? JSON.parse(currentShop.appSettings) 
        : {};
      
      const updatedSettings = {
        ...currentSettings,
        features
      };
      
      await prisma.shop.update({
        where: { shopDomain: shop },
        data: {
          appSettings: JSON.stringify(updatedSettings),
          onboardingStep: 'features_completed',
          lastActiveAt: new Date()
        }
      });
      
      console.log(`✅ Features saved for shop: ${shop}`);
      
    } catch (error) {
      console.error("❌ Failed to save features:", error);
      return json({ 
        error: "Fehler beim Speichern der Feature-Auswahl",
        success: false 
      });
    }
  }
  
  return json({ success: true, nextStep: Number(step) + 1 });
}

export default function OnboardingSetup() {
  const { shop, step: initialStep, totalSteps } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(actionData?.nextStep || initialStep);
  
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("retail");
  const [targetAudience, setTargetAudience] = useState("");
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#667eea");
  const [features, setFeatures] = useState({
    pushNotifications: true,
    loyaltyProgram: false,
    socialSharing: true,
    offlineMode: false
  });

  const progress = (currentStep / totalSteps) * 100;

  const businessTypeOptions = [
    { label: "Mode & Bekleidung", value: "fashion" },
    { label: "Elektronik & Technik", value: "electronics" },
    { label: "Haus & Garten", value: "home" },
    { label: "Gesundheit & Schönheit", value: "beauty" },
    { label: "Sport & Fitness", value: "sports" },
    { label: "Bücher & Medien", value: "books" },
    { label: "Sonstiges", value: "other" }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd">Schritt 1: Geschäftsinformationen</Text>
              
              <TextField
                label="Name Ihres Unternehmens"
                value={businessName}
                onChange={setBusinessName}
                placeholder="z.B. Mein Onlineshop"
                helpText="Dieser Name wird in Ihrer mobilen App angezeigt"
                autoComplete="organization"
              />
              
              <Select
                label="Branche"
                options={businessTypeOptions}
                value={businessType}
                onChange={setBusinessType}
              />
              
              <TextField
                label="Beschreibung Ihrer Zielgruppe"
                value={targetAudience}
                onChange={setTargetAudience}
                placeholder="z.B. Junge Erwachsene, Fashion-bewusste Kunden..."
                multiline={3}
                helpText="Hilft uns, Ihre App optimal zu gestalten"
              />
            </BlockStack>
          </Card>
        );
        
      case 2:
        return (
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd">Schritt 2: App-Design</Text>
              
              <TextField
                label="Name Ihrer App"
                value={appName}
                onChange={setAppName}
                placeholder={businessName || "Meine App"}
                helpText="So wird Ihre App in den App Stores heißen"
              />
              
              <TextField
                label="App-Beschreibung"
                value={appDescription}
                onChange={setAppDescription}
                placeholder="Eine moderne Shopping-App für..."
                multiline={3}
                helpText="Kurze Beschreibung für die App Store Listings"
              />
              
              <div>
                <Text variant="bodyMd" as="p">Primärfarbe</Text>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: "60px", height: "40px", border: "none", borderRadius: "4px" }}
                />
              </div>
            </BlockStack>
          </Card>
        );
        
      case 3:
        return (
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd">Schritt 3: Features auswählen</Text>
              
              <BlockStack gap="300">
                <Checkbox
                  label="Push-Benachrichtigungen"
                  helpText="Senden Sie Kunden Updates über neue Produkte und Angebote"
                  checked={features.pushNotifications}
                  onChange={(checked) => setFeatures(prev => ({ ...prev, pushNotifications: checked }))}
                />
                
                <Checkbox
                  label="Treueprogramm"
                  helpText="Belohnen Sie wiederkehrende Kunden mit Punkten"
                  checked={features.loyaltyProgram}
                  onChange={(checked) => setFeatures(prev => ({ ...prev, loyaltyProgram: checked }))}
                />
                
                <Checkbox
                  label="Social Media Integration"
                  helpText="Kunden können Produkte einfach teilen"
                  checked={features.socialSharing}
                  onChange={(checked) => setFeatures(prev => ({ ...prev, socialSharing: checked }))}
                />
                
                <Checkbox
                  label="Offline-Modus"
                  helpText="App funktioniert auch ohne Internetverbindung (Beta)"
                  checked={features.offlineMode}
                  onChange={(checked) => setFeatures(prev => ({ ...prev, offlineMode: checked }))}
                />
              </BlockStack>
            </BlockStack>
          </Card>
        );
        
      case 4:
        return (
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd">Schritt 4: Zusammenfassung</Text>
              
              <Banner title="🎉 Ihre App ist bereit!" tone="success">
                <Text variant="bodyMd">
                  Wir erstellen jetzt Ihre mobile App mit den folgenden Einstellungen:
                </Text>
              </Banner>
              
              <BlockStack gap="200">
                <Text variant="headingSm">App-Details:</Text>
                <Text variant="bodyMd">• Name: {appName || businessName}</Text>
                <Text variant="bodyMd">• Branche: {businessTypeOptions.find(opt => opt.value === businessType)?.label}</Text>
                <Text variant="bodyMd">• Primärfarbe: <span style={{ color: primaryColor }}>●</span> {primaryColor}</Text>
              </BlockStack>
              
              <BlockStack gap="200">
                <Text variant="headingSm">Aktivierte Features:</Text>
                {features.pushNotifications && <Text variant="bodyMd">• Push-Benachrichtigungen</Text>}
                {features.loyaltyProgram && <Text variant="bodyMd">• Treueprogramm</Text>}
                {features.socialSharing && <Text variant="bodyMd">• Social Media Integration</Text>}
                {features.offlineMode && <Text variant="bodyMd">• Offline-Modus</Text>}
              </BlockStack>
            </BlockStack>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <Page 
      title="TurnApp Setup" 
      subtitle={`Schritt ${currentStep} von ${totalSteps}`}
      backAction={{ url: currentStep === 1 ? "/onboarding/welcome" : undefined }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <ProgressBar progress={progress} size="small" />
            </Card>
            
            <Form method="post">
              <input type="hidden" name="step" value={currentStep} />
              <BlockStack gap="400">
                {renderStep()}
                
                <Card>
                  <InlineStack align="space-between">
                    {currentStep > 1 && (
                      <Button 
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={navigation.state === "submitting"}
                      >
                        Zurück
                      </Button>
                    )}
                    
                    {currentStep < totalSteps ? (
                      <Button 
                        variant="primary"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        loading={navigation.state === "submitting"}
                      >
                        Weiter
                      </Button>
                    ) : (
                      <Button 
                        variant="primary"
                        submit
                        loading={navigation.state === "submitting"}
                      >
                        🚀 App erstellen
                      </Button>
                    )}
                  </InlineStack>
                </Card>
              </BlockStack>
            </Form>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}