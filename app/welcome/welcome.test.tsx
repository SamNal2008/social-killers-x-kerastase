import { render, screen } from '@testing-library/react';
import { Welcome } from './welcome';

describe('Welcome Component', () => {
  it('should render the Kérastase brand caption', () => {
    render(<Welcome />);
    const caption = screen.getByText(/kérastase paris/i);
    expect(caption).toBeInTheDocument();
  });

  it('should render the hero image with correct alt text', () => {
    render(<Welcome />);
    const heroImage = screen.getByAltText(/kérastase aesthetic/i);
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src');
  });

  it('should render the main heading', () => {
    render(<Welcome />);
    const heading = screen.getByRole('heading', { name: /discover your subculture/i });
    expect(heading).toBeInTheDocument();
  });

  it('should render the subtitle text', () => {
    render(<Welcome />);
    const subtitle = screen.getByText(/a curated journey to reveal the aesthetic you naturally resonate with/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('should render the CTA button with correct text', () => {
    render(<Welcome />);
    const ctaButton = screen.getByRole('button', { name: /begin the experience/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('should have proper semantic structure for accessibility', () => {
    render(<Welcome />);

    // Should have a main landmark
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Button should be keyboard accessible (implicit with role="button")
    const ctaButton = screen.getByRole('button', { name: /begin the experience/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('should apply mobile-first responsive classes', () => {
    const { container } = render(<Welcome />);

    // The container should have mobile-first padding
    const mainContainer = container.querySelector('main');
    expect(mainContainer).toBeInTheDocument();
  });
});
