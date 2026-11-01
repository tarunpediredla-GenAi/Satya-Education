import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookCoverArt } from '../components/BookCoverArt';
import { SelectedBookFormat } from '../types';

export const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { books, addToCart, hasEbookAccess, user, showToast } = useApp();
  const navigate = useNavigate();

  const book = books.find((b) => b.id === bookId);

  const [selectedFormat, setSelectedFormat] = useState<SelectedBookFormat>(
    book?.format === 'E-Book' ? 'E-Book' : 'Hardcover'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [readerOpen, setReaderOpen] = useState<boolean>(false);
  const [downloadingEbook, setDownloadingEbook] = useState<boolean>(false);

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif-display text-2xl font-bold text-[#0B192C]">Book Not Found</h1>
        <Link to="/books" className="text-sm font-semibold text-[#0D6E6E] hover:underline">
          ← Return to Bookstore
        </Link>
      </div>
    );
  }

  const unlocked = hasEbookAccess(book.id);
  const activePrice = selectedFormat === 'E-Book' ? book.ebookPriceInr : book.priceInr;
  const canBuyPhysical = book.format !== 'E-Book' && book.stock > 0;

  const handleAddToCart = () => {
    if (selectedFormat === 'Hardcover' && !canBuyPhysical) {
      showToast('Physical edition is currently out of stock. Select E-Book instead.');
      return;
    }
    addToCart(
      {
        cartItemId: `${book.id}_${selectedFormat}`,
        itemId: book.id,
        itemType: selectedFormat === 'E-Book' ? 'ebook' : 'physical_book',
        title: `${book.title} (${selectedFormat})`,
        subtitleOrAuthor: book.author,
        unitPriceInr: activePrice,
        maxStock: selectedFormat === 'Hardcover' ? book.stock : 1,
      },
      selectedFormat === 'Hardcover' ? quantity : 1
    );
  };

  const handleDownloadProtectedEbook = async () => {
    if (!unlocked || !user) {
      showToast('Please purchase this book to download the full E-Book edition.');
      return;
    }
    setDownloadingEbook(true);
    try {
      const res = await fetch('/api/access/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          itemId: book.id,
          itemType: 'ebook',
          isEnrollmentVerified: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Access denied');

      const fullText = `# ${book.title}\n## ${book.subtitle}\nAuthor: ${book.author}\nISBN: ${book.isbn}\nSigned Access Token: ${data.signedToken}\n\n---\n\n### Synopsis\n${book.description}\n\n### Excerpt & Study Chapters\n${book.previewExcerpt}\n\n### Table of Contents\n${book.tableOfContents.join('\n')}\n\n---\nDownloaded securely via Satya's Education Student Library for ${user.email}.`;

      const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.id}-satya-edition.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded full E-Book study edition');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadingEbook(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0B192C]/70 hover:text-[#0B192C]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Books Catalog</span>
      </Link>

      {/* Main Contiguous Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cover Art Showcase */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/10 shadow-xs space-y-4">
            <BookCoverArt book={book} className="h-96 w-full max-w-[280px] mx-auto" />
            <div className="pt-3 border-t border-[#0B192C]/10 flex items-center justify-between text-xs font-mono-tabular text-[#0B192C]/70">
              <span>ISBN: {book.isbn}</span>
              <span>{book.pages} Pages</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Details & Purchase Module */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-3 border-b border-[#0B192C]/10 pb-6">
            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#0D6E6E]">
              <span>{book.category}</span>
              <span aria-hidden="true">·</span>
              <span>{book.subcategory}</span>
              <span aria-hidden="true">·</span>
              <span>{book.language}</span>
              <span aria-hidden="true">·</span>
              <span>Published {book.publishYear}</span>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#0B192C]">
              {book.title}
            </h1>
            <p className="text-base sm:text-lg text-[#0B192C]/75">{book.subtitle}</p>
            <p className="text-sm font-semibold text-[#0B192C]">By {book.author}</p>
          </div>

          {/* Contiguous Purchase Module */}
          <div className="p-6 rounded-2xl bg-white border border-[#0B192C]/15 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0B192C]/60">
                  Select Format
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('E-Book')}
                    className={`px-4 py-2.5 rounded-xl border text-left transition-colors ${
                      selectedFormat === 'E-Book'
                        ? 'border-[#0D6E6E] bg-[#0D6E6E]/10 text-[#0B192C]'
                        : 'border-[#0B192C]/15 text-[#0B192C]/70 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="block text-xs font-semibold">Instant E-Book</span>
                    <span className="font-mono-tabular text-sm font-bold">₹{book.ebookPriceInr}</span>
                  </button>

                  {book.format !== 'E-Book' && (
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('Hardcover')}
                      className={`px-4 py-2.5 rounded-xl border text-left transition-colors ${
                        selectedFormat === 'Hardcover'
                          ? 'border-[#0D6E6E] bg-[#0D6E6E]/10 text-[#0B192C]'
                          : 'border-[#0B192C]/15 text-[#0B192C]/70 hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Clothbound Hardcover</span>
                      <span className="font-mono-tabular text-sm font-bold">₹{book.priceInr}</span>
                    </button>
                  )}
                </div>
              </div>

              {selectedFormat === 'Hardcover' && canBuyPhysical && (
                <div>
                  <label
                    htmlFor="detail-qty"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#0B192C]/60 mb-2"
                  >
                    Quantity (Stock: {book.stock})
                  </label>
                  <select
                    id="detail-qty"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5] text-sm font-mono-tabular"
                  >
                    {Array.from({ length: Math.min(10, book.stock) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-6 py-3 rounded-xl bg-[#0B192C] text-white text-sm font-semibold hover:bg-[#0D6E6E] transition-colors inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Add {selectedFormat} to Bag — ₹{(activePrice * (selectedFormat === 'Hardcover' ? quantity : 1)).toLocaleString('en-IN')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddToCart();
                  navigate('/checkout');
                }}
                className="px-5 py-3 rounded-xl bg-[#0D6E6E] text-white text-sm font-semibold hover:bg-[#0B192C] transition-colors"
              >
                Buy Now
              </button>

              {unlocked && (
                <button
                  type="button"
                  onClick={handleDownloadProtectedEbook}
                  disabled={downloadingEbook}
                  className="px-5 py-3 rounded-xl border border-[#0D6E6E] text-[#0D6E6E] text-sm font-semibold hover:bg-[#0D6E6E] hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingEbook ? 'Preparing Signed File...' : 'Download Purchased E-Book'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#0B192C]/10 text-xs text-[#0B192C]/70">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                <span>Free insured courier delivery across India on print orders above ₹999.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                <span>E-Book editions unlock immediately in your Student Dashboard upon payment.</span>
              </div>
            </div>
          </div>

          {/* Book Synopsis & Table of Contents */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#0B192C]">
                About This Book
              </h2>
              <p className="text-sm sm:text-base text-[#0B192C]/80 leading-relaxed mt-2">
                {book.description}
              </p>
            </div>

            {/* Chapter Preview Box */}
            <div className="p-6 rounded-2xl bg-[#F3EDE0] border border-[#0B192C]/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-display text-base font-semibold text-[#0B192C] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0D6E6E]" />
                  <span>Sample Chapter Excerpt</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setReaderOpen((prev) => !prev)}
                  className="text-xs font-semibold text-[#0D6E6E] hover:underline"
                >
                  {readerOpen ? 'Hide Extended Preview' : 'Read Extended Preview'}
                </button>
              </div>
              <p className="text-sm italic text-[#0B192C]/85 leading-relaxed">
                “{book.previewExcerpt}”
              </p>
              {readerOpen && (
                <div className="pt-3 border-t border-[#0B192C]/10 text-sm text-[#0B192C]/80 space-y-2 leading-relaxed">
                  <p>
                    {unlocked
                      ? 'Full Purchased Edition Unlocked: You have full access to all chapters of this book in your Student Dashboard and via direct signed download above.'
                      : 'This free preview displays the opening section. Purchase the E-Book or Hardcover edition to unlock the complete text and downloadable study companion.'}
                  </p>
                </div>
              )}
            </div>

            {/* Table of Contents */}
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#0B192C] mb-3">
                Table of Contents
              </h2>
              <div className="rounded-xl bg-white border border-[#0B192C]/10 divide-y divide-[#0B192C]/10">
                {book.tableOfContents.map((ch) => (
                  <div key={ch} className="px-5 py-3.5 text-sm text-[#0B192C] font-medium">
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
