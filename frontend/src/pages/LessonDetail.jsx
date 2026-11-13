import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import api from '@/services/api';
import { QuizWidget } from '@/components/features/QuizWidget';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const LESSON_REPOSITORY = [
  {
    slug: 'introduction-to-the-stock-market',
    title: 'Introduction to the Stock Market',
    order: 1,
    estimatedMinutes: 8,
    category: 'Foundations',
    content: `The stock market is a marketplace where shares of publicly listed companies are bought and sold. When you buy a share of a company, you are purchasing a small ownership stake in that business. Companies list their shares on stock exchanges to raise capital for growth, expansion, and operations.

Stock prices are determined by supply and demand. When more people want to buy a stock than sell it, the price goes up. When more people want to sell than buy, the price goes down. This continuous auction process happens throughout the trading day.

The two primary types of markets are the primary market and the secondary market. In the primary market, companies issue new shares through Initial Public Offerings (IPOs). In the secondary market, investors trade previously issued shares among themselves on stock exchanges.

Key participants in the stock market include retail investors (individuals like you), institutional investors (mutual funds, pension funds, insurance companies), brokers who facilitate trades, and market makers who provide liquidity by continuously offering to buy and sell shares.

Understanding the stock market is the foundation of building wealth through investing. While stock prices can be volatile in the short term, historically the stock market has provided higher returns than most other investment options over the long term.`,
    quizzes: [
      {
        id: 1,
        question: 'What does buying a share of a company represent?',
        options: [
          'A loan to the company',
          'A small ownership stake in the company',
          'A guaranteed return on investment',
          'A contract to work for the company',
        ],
        correctAnswer: 1,
        explanation: "When you buy a share, you are purchasing a small ownership stake in that company. You become a partial owner and may benefit from the company's growth through price appreciation and dividends.",
      },
      {
        id: 2,
        question: 'What determines stock prices in the market?',
        options: [
          'The government sets prices',
          'Company executives decide the price',
          'Supply and demand from buyers and sellers',
          'Stock prices are fixed and never change',
        ],
        correctAnswer: 2,
        explanation: 'Stock prices are determined by supply and demand. When more investors want to buy a stock than sell it, the price rises. When more want to sell, the price falls.',
      },
      {
        id: 3,
        question: 'What is an Initial Public Offering (IPO)?',
        options: [
          'When a company buys back its shares',
          'When a company issues new shares to the public for the first time',
          'When a stock is delisted from the exchange',
          'When dividends are distributed to shareholders',
        ],
        correctAnswer: 1,
        explanation: 'An IPO is when a company issues shares to the public for the first time in the primary market. This allows the company to raise capital from a wide range of investors.',
      },
      {
        id: 4,
        question: 'Where do investors trade previously issued shares?',
        options: [
          'Primary market',
          'Secondary market',
          'Private market',
          'Futures market',
        ],
        correctAnswer: 1,
        explanation: 'Previously issued shares are traded on the secondary market. Stock exchanges like the NSE, BSE, NYSE, and NASDAQ facilitate this trading between investors.',
      },
      {
        id: 5,
        question: 'Which of the following is NOT a key participant in the stock market?',
        options: [
          'Retail investors',
          'Market makers',
          'Central bank monetary policy committee',
          'Institutional investors',
        ],
        correctAnswer: 2,
        explanation: 'While central bank policies affect the stock market indirectly, the central bank monetary policy committee is not a direct participant in stock trading. Key participants include retail investors, institutional investors, brokers, and market makers.',
      },
    ],
  },
  {
    slug: 'stock-exchanges-and-how-they-work',
    title: 'Stock Exchanges and How They Work',
    order: 2,
    estimatedMinutes: 10,
    category: 'Market Mechanics',
    content: `A stock exchange is an organized marketplace where securities are bought and sold under a defined set of rules and regulations. Stock exchanges provide transparency, liquidity, and price discovery for publicly traded companies.

In India, the two major stock exchanges are the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE). The NSE is the largest exchange by trading volume and is home to the NIFTY 50 index. The BSE, established in 1875, is Asia's oldest stock exchange and tracks the SENSEX index comprising 30 major companies.

Internationally, prominent exchanges include the New York Stock Exchange (NYSE), NASDAQ, London Stock Exchange (LSE), and Tokyo Stock Exchange (TSE). Each exchange has its own listing requirements and trading hours.

Trading on exchanges happens through an electronic order-matching system. When a buyer places a bid (an offer to buy at a certain price) and a seller places an ask (an offer to sell at a certain price), the exchange matches these orders. When the bid price meets or exceeds the ask price, a trade is executed.

Stock market indices like NIFTY 50, SENSEX, S&P 500, and Dow Jones Industrial Average track the performance of a group of stocks and serve as benchmarks for the overall market. They help investors gauge market direction and compare investment performance.

Stock exchanges also enforce listing standards, trading rules, and corporate governance requirements. Companies must meet financial and reporting standards to remain listed, which provides investors with a baseline level of transparency and reliability.`,
    quizzes: [
      {
        id: 1,
        question: 'What is the primary purpose of a stock exchange?',
        options: [
          'To manufacture goods',
          'To provide a regulated marketplace for buying and selling securities',
          'To lend money to companies',
          'To set government fiscal policy',
        ],
        correctAnswer: 1,
        explanation: 'A stock exchange provides an organized, regulated marketplace where securities are bought and sold with transparency, liquidity, and proper price discovery.',
      },
      {
        id: 2,
        question: 'Which stock exchange is the largest in India by trading volume?',
        options: ['BSE', 'NSE', 'MCX', 'NCDEX'],
        correctAnswer: 1,
        explanation: 'The National Stock Exchange (NSE) is the largest stock exchange in India by trading volume. It is home to the NIFTY 50 index.',
      },
      {
        id: 3,
        question: 'What is the SENSEX?',
        options: [
          'A stock trading platform',
          'An index of 30 major companies listed on the BSE',
          'A type of mutual fund',
          'A government regulation',
        ],
        correctAnswer: 1,
        explanation: 'The SENSEX is the benchmark index of the Bombay Stock Exchange (BSE), comprising 30 major companies. It serves as a barometer for the market.',
      },
      {
        id: 4,
        question: 'How are trades executed on modern stock exchanges?',
        options: [
          'Through physical paper certificates',
          'By shouting orders on the trading floor',
          'Through electronic order-matching systems',
          'By telephone calls to brokers only',
        ],
        correctAnswer: 2,
        explanation: "Modern stock exchanges use electronic order-matching systems. When a buyer's bid price meets or exceeds a seller's ask price, the system automatically executes the trade.",
      },
      {
        id: 5,
        question: 'What is the role of stock market indices?',
        options: [
          'They set individual stock prices',
          'They track the performance of a group of stocks and serve as market benchmarks',
          'They guarantee investment returns',
          'They regulate broker commissions',
        ],
        correctAnswer: 1,
        explanation: 'Stock market indices track the performance of a group of stocks and serve as benchmarks. They help investors understand overall market direction and compare investment performance.',
      },
    ],
  },
  {
    slug: 'market-orders-and-basic-trading',
    title: 'Market Orders and Basic Trading',
    order: 3,
    estimatedMinutes: 12,
    category: 'Execution',
    content: `Understanding order types is fundamental to trading stocks. An order is an instruction you give to your broker to buy or sell a security. The type of order determines how and when your trade is executed.

A market order is the simplest type of order. It instructs your broker to buy or sell a stock immediately at the best available current price. Market orders prioritize speed of execution over price. They are almost always filled instantly during market hours, but the exact execution price may differ slightly from the last quoted price, especially for less liquid stocks.

A limit order lets you set a maximum price for buying or a minimum price for selling. A buy limit order will only execute at the limit price or lower. A sell limit order will only execute at the limit price or higher. Limit orders give you price control but do not guarantee execution since the market may never reach your specified price.

When placing any trade, you specify the quantity (number of shares) and the side (buy or sell). For buying, you need sufficient funds in your account. For selling, you need to own the shares you are selling. This is known as delivery-based trading.

The bid-ask spread is the difference between the highest price a buyer is willing to pay (bid) and the lowest price a seller is willing to accept (ask). Highly liquid stocks have narrow spreads, meaning you can trade them with minimal price impact. Less liquid stocks have wider spreads and may be harder to trade at desired prices.

Paper trading is a risk-free way to practice trading without using real money. It simulates real market conditions so you can learn how orders work, test strategies, and build confidence before committing actual capital.`,
    quizzes: [
      {
        id: 1,
        question: 'What is a market order?',
        options: [
          'An order that sets a specific price',
          'An order to buy or sell immediately at the best available price',
          'An order that is valid for one month',
          'An order placed after market hours',
        ],
        correctAnswer: 1,
        explanation: 'A market order instructs your broker to execute the trade immediately at the best available current price. It prioritizes execution speed over getting a specific price.',
      },
      {
        id: 2,
        question: 'What advantage does a limit order provide over a market order?',
        options: [
          'Guaranteed execution',
          'Faster execution',
          'Price control',
          'Lower brokerage fees',
        ],
        correctAnswer: 2,
        explanation: 'A limit order gives you price control. You set the maximum price for buying or minimum price for selling. However, unlike market orders, limit orders do not guarantee execution.',
      },
      {
        id: 3,
        question: 'What is the bid-ask spread?',
        options: [
          'The difference between the opening and closing price',
          'The difference between the highest bid and the lowest ask price',
          'The daily price range of a stock',
          'The commission charged by the broker',
        ],
        correctAnswer: 1,
        explanation: 'The bid-ask spread is the difference between the highest price a buyer is willing to pay (bid) and the lowest price a seller is willing to accept (ask). Liquid stocks have narrower spreads.',
      },
      {
        id: 4,
        question: 'What must you have to sell shares in delivery-based trading?',
        options: [
          'A margin account',
          'Sufficient cash in your account',
          'The shares in your demat account',
          'Permission from the company',
        ],
        correctAnswer: 2,
        explanation: 'In delivery-based trading, you must own the shares you are selling. They must be available in your demat or brokerage account before you can place a sell order.',
      },
      {
        id: 5,
        question: 'What is the primary benefit of paper trading?',
        options: [
          'You earn real profits',
          'You can practice trading without risking real money',
          'You get priority access to IPOs',
          'You receive free research reports',
        ],
        correctAnswer: 1,
        explanation: 'Paper trading simulates real market conditions without using actual money. It lets you practice order placement, test strategies, and learn from mistakes without financial risk.',
      },
    ],
  },
  {
    slug: 'portfolio-diversification',
    title: 'Portfolio Diversification',
    order: 4,
    estimatedMinutes: 10,
    category: 'Portfolio Management',
    content: `Diversification is one of the most important principles in investing. It means spreading your investments across different assets, sectors, and geographies to reduce the overall risk of your portfolio.

The idea behind diversification is simple: do not put all your eggs in one basket. If you invest your entire capital in a single stock and that company performs poorly, you could lose a significant portion of your investment. By holding multiple stocks across different sectors, the poor performance of one holding can be offset by the good performance of others.

There are several dimensions of diversification. Sector diversification means investing across industries such as technology, banking, healthcare, energy, and consumer goods. Geographic diversification involves investing in companies from different countries or regions. Asset class diversification includes combining stocks with bonds, real estate, gold, and other investment types.

Correlation is a key concept in diversification. Investments that are positively correlated tend to move in the same direction. For effective diversification, you want assets with low or negative correlation so that when one falls, another may hold steady or rise.

A well-diversified portfolio typically holds 15 to 25 stocks across at least 5 to 7 sectors. Over-diversification (holding too many stocks) can dilute returns and make portfolio management difficult. Under-diversification (holding too few stocks) leaves you exposed to concentration risk.

While diversification reduces unsystematic risk (company-specific or sector-specific risk), it cannot eliminate systematic risk (market-wide risk that affects all securities). Events like recessions, interest rate changes, or geopolitical crises affect the entire market and cannot be diversified away.`,
    quizzes: [
      {
        id: 1,
        question: 'What is the primary purpose of portfolio diversification?',
        options: [
          'To maximize returns from a single stock',
          'To reduce overall portfolio risk by spreading investments',
          'To avoid paying taxes',
          'To concentrate investments in one high-performing sector',
        ],
        correctAnswer: 1,
        explanation: 'Diversification aims to reduce overall portfolio risk by spreading investments across different assets, sectors, and geographies. Poor performance in one area can be offset by gains in another.',
      },
      {
        id: 2,
        question: 'What type of risk can diversification reduce?',
        options: [
          'Systematic risk',
          'Unsystematic risk',
          'Currency risk only',
          'All types of risk completely',
        ],
        correctAnswer: 1,
        explanation: 'Diversification reduces unsystematic risk, which is risk specific to individual companies or sectors. It cannot eliminate systematic risk, which affects the entire market.',
      },
      {
        id: 3,
        question: 'How many stocks does a well-diversified portfolio typically hold?',
        options: ['1 to 3', '5 to 10', '15 to 25', '100 or more'],
        correctAnswer: 2,
        explanation: 'A well-diversified portfolio typically holds 15 to 25 stocks across at least 5 to 7 sectors. This balances risk reduction with manageable portfolio complexity.',
      },
      {
        id: 4,
        question: 'For effective diversification, you want investments with what type of correlation?',
        options: [
          'High positive correlation',
          'Low or negative correlation',
          'Perfect positive correlation',
          'Correlation does not matter',
        ],
        correctAnswer: 1,
        explanation: 'For effective diversification, you want investments with low or negative correlation. This means when one investment falls, the other may hold steady or rise, reducing overall portfolio volatility.',
      },
      {
        id: 5,
        question: 'What is systematic risk?',
        options: [
          'Risk specific to a single company',
          'Risk that affects the entire market and cannot be diversified away',
          'Risk caused by poor management decisions',
          'Risk that only affects technology stocks',
        ],
        correctAnswer: 1,
        explanation: 'Systematic risk is market-wide risk that affects all securities. Events like recessions, interest rate changes, and geopolitical crises create systematic risk. Diversification cannot eliminate it.',
      },
    ],
  },
  {
    slug: 'risk-management-in-stock-trading',
    title: 'Risk Management in Stock Trading',
    order: 5,
    estimatedMinutes: 15,
    category: 'Risk Control',
    content: `Risk management is the process of identifying, assessing, and controlling financial risks in your trading and investment activities. Without proper risk management, even profitable strategies can lead to devastating losses.

Position sizing is one of the most critical risk management techniques. It determines how much of your capital to allocate to a single trade. A common guideline is to never risk more than 1-2% of your total portfolio on any single trade. This ensures that even a string of losing trades will not wipe out your capital.

Stop-loss orders are instructions to sell a stock automatically when it falls to a certain price. They limit your downside by closing positions before losses become too large. For example, if you buy a stock at 500 rupees, you might set a stop-loss at 475 rupees to limit your maximum loss to 5%.

The risk-reward ratio compares the potential loss of a trade to its potential gain. A ratio of 1:2 means you risk 1 rupee to potentially gain 2 rupees. Successful traders typically aim for a minimum risk-reward ratio of 1:2 or higher. This means that even if you are right only half the time, you can still be profitable overall.

Emotional discipline is equally important. Fear and greed are the two emotions that most commonly derail trading decisions. Fear causes premature selling of winning positions and hesitation in entering good setups. Greed causes holding losing positions too long and taking excessive risks. Developing a trading plan and sticking to it helps overcome emotional decision-making.

Dollar-cost averaging (or rupee-cost averaging) is a strategy where you invest a fixed amount at regular intervals regardless of price. This reduces the impact of volatility by buying more shares when prices are low and fewer when prices are high, resulting in a lower average cost per share over time.`,
    quizzes: [
      {
        id: 1,
        question: 'What is the recommended maximum percentage of your portfolio to risk on a single trade?',
        options: ['10-15%', '5-8%', '1-2%', '25-30%'],
        correctAnswer: 2,
        explanation: 'A common risk management guideline is to never risk more than 1-2% of your total portfolio on a single trade. This protects your capital even during a series of losses.',
      },
      {
        id: 2,
        question: 'What is the purpose of a stop-loss order?',
        options: [
          'To maximize profits on winning trades',
          'To automatically sell a stock when it falls to a specified price to limit losses',
          'To buy additional shares at a lower price',
          'To lock in a minimum selling price forever',
        ],
        correctAnswer: 1,
        explanation: 'A stop-loss order automatically sells a stock when its price drops to a specified level. It limits your downside by closing the position before losses become too large.',
      },
      {
        id: 3,
        question: 'What does a risk-reward ratio of 1:3 mean?',
        options: [
          'You risk 3 rupees for every 1 rupee of potential gain',
          'You risk 1 rupee for every 3 rupees of potential gain',
          'You must win 3 times out of every 4 trades',
          'Your maximum loss is 3% of your portfolio',
        ],
        correctAnswer: 1,
        explanation: 'A risk-reward ratio of 1:3 means you risk 1 rupee for every 3 rupees of potential gain. Higher ratios allow traders to be profitable even with a lower win rate.',
      },
      {
        id: 4,
        question: 'Which two emotions most commonly derail trading decisions?',
        options: [
          'Boredom and excitement',
          'Fear and greed',
          'Patience and urgency',
          'Optimism and pessimism',
        ],
        correctAnswer: 1,
        explanation: 'Fear and greed are the two emotions that most commonly derail trading. Fear leads to premature selling and missed opportunities. Greed leads to holding losers too long and excessive risk-taking.',
      },
      {
        id: 5,
        question: 'What is dollar-cost averaging (rupee-cost averaging)?',
        options: [
          'Buying stocks only when prices are at their lowest',
          'Investing a fixed amount at regular intervals regardless of price',
          'Selling a fixed percentage of holdings every month',
          'Converting investments between different currencies',
        ],
        correctAnswer: 1,
        explanation: 'Dollar-cost averaging (or rupee-cost averaging) means investing a fixed amount at regular intervals. This strategy reduces the impact of volatility by averaging out the purchase price over time.',
      },
    ],
  },
];

function getStoredQuizResult(slug) {
  try {
    const raw = localStorage.getItem('tradewise_quiz_results');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed[slug] || null;
  } catch {
    return null;
  }
}

export default function LessonDetail({ className }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(() => {
    return LESSON_REPOSITORY.find((l) => l.slug === slug) || null;
  });
  const [quizResult, setQuizResult] = useState(() => getStoredQuizResult(slug));
  const [isLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadLessonData() {
      if (!slug) return;

      const fallbackLesson = LESSON_REPOSITORY.find((l) => l.slug === slug);
      setQuizResult(getStoredQuizResult(slug));

      if (!fallbackLesson) {
        // Attempt API lookup if not in static list
        try {
          const res = await api.get(`/api/lessons/${slug}`);
          if (active && res.data?.lesson) {
            setLesson(res.data.lesson);
            setError(null);
            return;
          }
        } catch {
          if (active) {
            setLesson(null);
            setError(`Lesson "${slug}" could not be found.`);
          }
          return;
        }
      }

      // If in static list, we try to augment from API if available
      try {
        const res = await api.get(`/api/lessons/${slug}`);
        if (active && res.data?.lesson) {
          setLesson({
            ...fallbackLesson,
            ...res.data.lesson,
            quizzes: fallbackLesson?.quizzes || res.data.lesson.quizzes,
          });
        } else if (active) {
          setLesson(fallbackLesson);
        }
      } catch {
        if (active) {
          setLesson(fallbackLesson);
        }
      }
    }

    loadLessonData();

    return () => {
      active = false;
    };
  }, [slug]);

  const handleQuizSubmit = (result) => {
    setQuizResult(result);
    try {
      const raw = localStorage.getItem('tradewise_quiz_results');
      const allResults = raw ? JSON.parse(raw) : {};
      allResults[slug] = result;
      localStorage.setItem('tradewise_quiz_results', JSON.stringify(allResults));
    } catch {
      // Ignore local storage write errors
    }
  };

  // Determine prev and next lessons
  const currentIndex = LESSON_REPOSITORY.findIndex((l) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? LESSON_REPOSITORY[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < LESSON_REPOSITORY.length - 1 ? LESSON_REPOSITORY[currentIndex + 1] : null;

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className={cn('max-w-3xl mx-auto space-y-6 py-4', className)}>
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="space-y-4 pt-4 border-t border-(--color-border)">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // Gracefully handle invalid or missing lesson slugs
  if (!lesson) {
    return (
      <div className={cn('max-w-3xl mx-auto py-12 px-4 text-center space-y-4', className)}>
        <div className="w-12 h-12 mx-auto rounded-full bg-(--color-error-subtle) text-(--color-error) flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-(--color-text-primary)">
          Lesson Not Found
        </h2>
        <p className="text-xs text-(--color-text-muted) max-w-md mx-auto">
          {error || `The requested lesson slug "${slug}" does not exist in our curriculum catalog.`}
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/learn')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  const paragraphs = lesson.content ? lesson.content.split('\n\n') : [];

  return (
    <div className={cn('max-w-3xl mx-auto space-y-8 py-2 pb-12', className)}>
      {/* Top navigation bar */}
      <div className="flex items-center justify-between pb-3 border-b border-(--color-border)">
        <Link to="/learn">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Lessons
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">
            Lesson {lesson.order ?? 1} of {LESSON_REPOSITORY.length}
          </Badge>
          {quizResult?.completed && (
            <Badge variant="success" size="sm">
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Lesson Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-(--color-brand) uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>{lesson.category || 'Trading Foundations'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--color-text-primary) leading-tight">
          {lesson.title}
        </h1>

        <div className="flex items-center gap-4 text-xs font-mono text-(--color-text-muted) pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{lesson.estimatedMinutes || 10} min read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lesson.quizzes?.length || 5} Quiz Questions</span>
          </div>
        </div>
      </div>

      {/* Lesson Reading Content */}
      <article className="space-y-5 text-sm text-(--color-text-secondary) leading-relaxed border-t border-(--color-border) pt-6">
        {paragraphs.map((para, index) => (
          <p key={index} className="text-sm leading-relaxed text-(--color-text-primary)/90">
            {para}
          </p>
        ))}
      </article>

      {/* Quiz Section below lesson content */}
      <section className="pt-6 border-t border-(--color-border) space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-(--color-brand)" />
          <h2 className="text-lg font-bold text-(--color-text-primary) tracking-tight">
            Assessment &amp; Knowledge Check
          </h2>
        </div>

        <QuizWidget
          questions={lesson.quizzes || []}
          initialResult={quizResult}
          onSubmit={handleQuizSubmit}
        />
      </section>

      {/* Previous / Next Lesson Navigation */}
      <nav className="pt-6 border-t border-(--color-border) grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevLesson ? (
          <Link
            to={`/learn/${prevLesson.slug}`}
            className="group block p-4 rounded-xl border border-(--color-border) bg-(--color-bg-subtle) hover:bg-(--color-bg-raised) transition-colors"
          >
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-(--color-text-muted) mb-1">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Previous Lesson</span>
            </div>
            <div className="text-sm font-semibold text-(--color-text-primary) group-hover:text-(--color-brand) transition-colors line-clamp-1">
              {prevLesson.title}
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-(--color-border)/50 text-[11px] font-mono text-(--color-text-muted) flex items-center justify-center">
            Beginning of curriculum
          </div>
        )}

        {nextLesson ? (
          <Link
            to={`/learn/${nextLesson.slug}`}
            className="group block p-4 rounded-xl border border-(--color-border) bg-(--color-bg-subtle) hover:bg-(--color-bg-raised) transition-colors text-right"
          >
            <div className="flex items-center justify-end gap-2 text-[11px] font-mono uppercase tracking-wider text-(--color-text-muted) mb-1">
              <span>Next Lesson</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="text-sm font-semibold text-(--color-text-primary) group-hover:text-(--color-brand) transition-colors line-clamp-1">
              {nextLesson.title}
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-(--color-border)/50 text-[11px] font-mono text-(--color-text-muted) flex items-center justify-center">
            You have reached the end of this track
          </div>
        )}
      </nav>
    </div>
  );
}
