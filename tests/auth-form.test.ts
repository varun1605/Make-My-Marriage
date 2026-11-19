import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthForm } from "@/components/auth/auth-form";

// Inspect actual server HTML: React submit handlers cannot protect this markup
// when JavaScript is disabled or the client bundle never loads.
describe.each(["login", "signup"] as const)("%s form before JavaScript is ready", mode => {
  const render = () => renderToStaticMarkup(createElement(AuthForm, { mode }));

  it("never defaults to a GET submission of credentials", () => {
    const formTag = render().match(/<form\b[^>]*>/)?.[0];
    expect(formTag).toBeDefined();
    expect(formTag).toContain('method="post"');
    expect(formTag).toContain(`action="/api/auth/${mode}"`);
  });

  it("keeps every credential input and submit control inside a disabled fieldset", () => {
    const form = render().match(/<form\b[^>]*>[\s\S]*?<\/form>/)?.[0];
    const fieldset = form?.match(/<fieldset\b[^>]*\bdisabled=""[^>]*>[\s\S]*?<\/fieldset>/)?.[0];
    expect(fieldset).toBeDefined();
    expect(fieldset).toContain('name="email"');
    expect(fieldset).toContain('name="password"');
    if (mode === "signup") expect(fieldset).toContain('name="name"');
    expect(fieldset).toContain('type="submit"');
    const outsideFieldset = form?.replace(fieldset!, "");
    expect(outsideFieldset).not.toMatch(/<(?:input|button)\b/);
  });

  it("explains how to use the form when scripting is disabled", () => {
    const notice = render().match(/<noscript>[\s\S]*?<\/noscript>/)?.[0];
    expect(notice).toContain("Enable JavaScript");
  });
});
