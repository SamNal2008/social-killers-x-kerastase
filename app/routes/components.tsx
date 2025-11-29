import { useState } from "react";
import { Title, Body, Caption } from "~/shared/components/Typography";
import { Button } from "~/shared/components/Button";
import { Input } from "~/shared/components/Input";
import { Badge } from "~/shared/components/Badge";
import { ProgressIndicator } from "~/shared/components/ProgressIndicator";
import { CircleButton } from "~/shared/components/CircleButton";
import { Card } from "~/shared/components/Card";
import { Polaroid } from "~/shared/components/Polaroid";

export default function ComponentShowcase() {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-surface-light">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <Title variant="h0" className="text-neutral-dark mb-4">
            Component Showcase
          </Title>
          <Body variant="1" className="text-neutral-gray">
            Design System Components - Kérastase Experience
          </Body>
        </div>

        <div className="space-y-16">
          {/* Typography */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Typography
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg space-y-4">
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Title - H0
                </Caption>
                <Title variant="h0" className="text-neutral-dark">
                  The quick brown fox
                </Title>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Title - H1
                </Caption>
                <Title variant="h1" className="text-neutral-dark">
                  The quick brown fox
                </Title>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Title - H2
                </Caption>
                <Title variant="h2" className="text-neutral-dark">
                  The quick brown fox
                </Title>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Title - H3
                </Caption>
                <Title variant="h3" className="text-neutral-dark">
                  The quick brown fox
                </Title>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Body - 1
                </Caption>
                <Body variant="1" className="text-neutral-dark">
                  The quick brown fox jumps over the lazy dog
                </Body>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Body - 2
                </Caption>
                <Body variant="2" className="text-neutral-dark">
                  The quick brown fox jumps over the lazy dog
                </Body>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Caption - 1
                </Caption>
                <div>
                  <Caption variant="1" className="text-neutral-dark">
                    Kérastase Experience
                  </Caption>
                </div>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Caption - 2
                </Caption>
                <div>
                  <Caption variant="2" className="text-neutral-dark">
                    Posted 2 hours ago
                  </Caption>
                </div>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Buttons
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg space-y-4">
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Primary
                </Caption>
                <div>
                  <Button variant="primary">Primary Button</Button>
                </div>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Secondary
                </Caption>
                <div>
                  <Button variant="secondary">Secondary Button</Button>
                </div>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Tertiary
                </Caption>
                <div>
                  <Button variant="tertiary">Tertiary Button</Button>
                </div>
              </div>
              <div>
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Disabled
                </Caption>
                <div>
                  <Button disabled>Disabled Button</Button>
                </div>
              </div>
            </div>
          </section>

          {/* Input */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Input
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg space-y-6">
              <div className="max-w-md">
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Default
                </Caption>
                <Input placeholder="Your name" />
              </div>
              <div className="max-w-md">
                <Caption variant="2" className="text-neutral-gray mb-2">
                  With Error
                </Caption>
                <Input placeholder="Email address" error="This field is required" />
              </div>
              <div className="max-w-md">
                <Caption variant="2" className="text-neutral-gray mb-2">
                  Disabled
                </Caption>
                <Input placeholder="Disabled input" disabled />
              </div>
            </div>
          </section>

          {/* Badges */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Badges
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg">
              <div className="flex flex-wrap gap-3">
                <Badge>Static Badge</Badge>
                <Badge
                  onClick={() => setSelectedBadge("legacy")}
                  selected={selectedBadge === "legacy"}
                >
                  Legacy
                </Badge>
                <Badge
                  onClick={() => setSelectedBadge("modern")}
                  selected={selectedBadge === "modern"}
                >
                  Modern
                </Badge>
                <Badge
                  onClick={() => setSelectedBadge("minimalist")}
                  selected={selectedBadge === "minimalist"}
                >
                  Minimalist
                </Badge>
              </div>
            </div>
          </section>

          {/* Progress Indicator */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Progress Indicator
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg">
              <div className="max-w-md">
                <ProgressIndicator currentStep={1} totalSteps={5} />
              </div>
            </div>
          </section>

          {/* Circle Buttons */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Circle Buttons
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <div>
                  <Caption variant="2" className="text-neutral-gray mb-2">
                    Default
                  </Caption>
                  <CircleButton variant="default" ariaLabel="Close" />
                </div>
                <div>
                  <Caption variant="2" className="text-neutral-gray mb-2">
                    Left
                  </Caption>
                  <CircleButton variant="left" ariaLabel="Previous" />
                </div>
                <div>
                  <Caption variant="2" className="text-neutral-gray mb-2">
                    Right
                  </Caption>
                  <CircleButton variant="right" ariaLabel="Next" />
                </div>
                <div>
                  <Caption variant="2" className="text-neutral-gray mb-2">
                    Heart
                  </Caption>
                  <CircleButton variant="heart" ariaLabel="Like" />
                </div>
              </div>
            </div>
          </section>

          {/* Card */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Card
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg">
              <div className="max-w-xs">
                <Card
                  imageSrc="https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400"
                  imageAlt="Moodboard"
                  onClick={() => alert("Card clicked!")}
                />
              </div>
            </div>
          </section>

          {/* Polaroid */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Polaroid
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg">
              <Polaroid
                title="Aesop"
                subtitle="Swipe to decide"
                currentItem={2}
                totalItems={7}
              />
            </div>
          </section>

          {/* Colors */}
          <section>
            <Title variant="h2" className="text-neutral-dark mb-6">
              Color Palette
            </Title>
            <div className="bg-neutral-white p-8 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="bg-primary h-20 rounded-lg mb-2" />
                  <Caption variant="2" className="text-neutral-dark">
                    Primary
                  </Caption>
                  <Caption variant="2" className="text-neutral-gray">
                    #C9A961
                  </Caption>
                </div>
                <div>
                  <div className="bg-neutral-dark h-20 rounded-lg mb-2" />
                  <Caption variant="2" className="text-neutral-dark">
                    Neutral Dark
                  </Caption>
                  <Caption variant="2" className="text-neutral-gray">
                    #101828
                  </Caption>
                </div>
                <div>
                  <div className="bg-neutral-white border border-neutral-gray-200 h-20 rounded-lg mb-2" />
                  <Caption variant="2" className="text-neutral-dark">
                    Neutral White
                  </Caption>
                  <Caption variant="2" className="text-neutral-gray">
                    #FFFFFF
                  </Caption>
                </div>
                <div>
                  <div className="bg-neutral-gray h-20 rounded-lg mb-2" />
                  <Caption variant="2" className="text-neutral-dark">
                    Neutral Gray
                  </Caption>
                  <Caption variant="2" className="text-neutral-gray">
                    #6A7282
                  </Caption>
                </div>
                <div>
                  <div className="bg-neutral-gray-200 h-20 rounded-lg mb-2" />
                  <Caption variant="2" className="text-neutral-dark">
                    Neutral Gray 200
                  </Caption>
                  <Caption variant="2" className="text-neutral-gray">
                    #D9DBE1
                  </Caption>
                </div>
                <div>
                  <div className="bg-surface-light h-20 rounded-lg mb-2 border border-neutral-gray-200" />
                  <Caption variant="2" className="text-neutral-dark">
                    Surface Light
                  </Caption>
                  <Caption variant="2" className="text-neutral-gray">
                    #F9FAFB
                  </Caption>
                </div>
                <div>
                  <div className="bg-feedback-success h-20 rounded-lg mb-2" />
                  <Caption variant="2" className="text-neutral-dark">
                    Success
                  </Caption>
                  <Caption variant="2" className="text-neutral-gray">
                    #0E9F6E
                  </Caption>
                </div>
                <div>
                  <div className="bg-feedback-error h-20 rounded-lg mb-2" />
                  <Caption variant="2" className="text-neutral-dark">
                    Error
                  </Caption>
                  <Caption variant="2" className="text-neutral-gray">
                    #E5484D
                  </Caption>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
