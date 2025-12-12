/**
 * Footer Component
 *
 * Site footer with links and info.
 *
 * @owner Frontend Team
 *
 * Features:
 * - [ ] Copyright notice
 * - [ ] Links: About, Terms, Privacy, Help
 * - [ ] Social media links (optional)
 */

export function Footer() {
  // TODO: Implement footer UI
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} gomigomi. All rights reserved.</p>
        {/* TODO: Add links */}
      </div>
    </footer>
  );
}
