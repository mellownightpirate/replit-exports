import { useState } from "react";
import { useForm } from "react-hook-form";
import { trackEvent, trackConversion, trackCTAClick } from "@/lib/analytics";
import { useTracking } from "@/contexts/TrackingContext";

type QuizState = "start" | "questions" | "results";
type QuizResult = "ready" | "almost" | "curious" | null;

type FormValues = {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  email?: string;
  [key: string]: string | undefined; // Index signature to allow string indexing
};

export default function QuizSection() {
  const [quizState, setQuizState] = useState<QuizState>("start");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quizResult, setQuizResult] = useState<QuizResult>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const { trackConversion: trackExternalConversion } = useTracking();
  
  const watchedValues = watch();

  const questions = [
    {
      id: 1,
      question: "How would you describe your current tech skills?",
      options: [
        { value: "1", label: "I'm completely new to tech" },
        { value: "2", label: "I have some basic knowledge" },
        { value: "3", label: "I have intermediate skills in one or more areas" },
        { value: "4", label: "I have advanced skills but need help transitioning" }
      ]
    },
    {
      id: 2,
      question: "How much time can you commit to learning each week?",
      options: [
        { value: "1", label: "Less than 5 hours" },
        { value: "2", label: "5-10 hours" },
        { value: "3", label: "10-15 hours" },
        { value: "4", label: "15+ hours" }
      ]
    },
    {
      id: 3,
      question: "What's your timeline for transitioning to a tech role?",
      options: [
        { value: "1", label: "I'm just exploring options right now" },
        { value: "2", label: "Within the next year" },
        { value: "3", label: "Within the next 6 months" },
        { value: "4", label: "As soon as possible" }
      ]
    },
    {
      id: 4,
      question: "What's your biggest challenge in pursuing a tech career?",
      options: [
        { value: "1", label: "I don't know where to start" },
        { value: "2", label: "I lack confidence in my abilities" },
        { value: "3", label: "I'm not sure which tech path is right for me" },
        { value: "4", label: "I need help standing out to employers" }
      ]
    },
    {
      id: 5,
      question: "Are you willing to invest in your career development?",
      options: [
        { value: "1", label: "I'm looking for free resources only" },
        { value: "2", label: "I can invest a small amount" },
        { value: "3", label: "I'm ready to invest in the right program" },
        { value: "4", label: "I see this as a priority investment in my future" }
      ]
    }
  ];

  const startQuiz = () => {
    trackEvent('click', 'quiz', 'start_quiz');
    setQuizState("questions");
    setCurrentQuestion(1);
  };

  const nextQuestion = () => {
    if (!watchedValues[`q${currentQuestion}`]) {
      alert('Please select an answer before continuing.');
      return;
    }
    
    if (currentQuestion < 5) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = (data: FormValues) => {
    let score = 0;
    
    for (let i = 1; i <= 5; i++) {
      const answer = data[`q${i}` as keyof FormValues];
      if (answer) {
        score += parseInt(answer);
      }
    }
    
    let result: QuizResult;
    if (score >= 15) {
      result = "ready";
    } else if (score >= 10) {
      result = "almost";
    } else {
      result = "curious";
    }
    
    // Track quiz completion as a conversion in our internal analytics system
    trackConversion('quiz_completion', { 
      // Add as custom fields that will be safely ignored by typescript
      customData: {
        score: score,
        result: result,
        answers: data
      }
    });
    
    // Track in external platforms (Google Ads, Meta Pixel, GA4) via TrackingContext
    trackExternalConversion('quiz_completion', {
      quiz_result: result,
      quiz_score: score
    });
    
    setQuizResult(result);
    setQuizState("results");
  };

  const submitWaitlistEmail = async (data: FormValues) => {
    console.log("Submitting email to ConvertKit:", data.email);
    
    try {
      // Track waitlist signup as a conversion in our internal analytics
      trackConversion('waitlist_signup', { 
        email: data.email,
        // Custom data for analytics
        customData: {
          quizResult: quizResult
        }
      });
      
      // Track as 'signup' for Reddit's required event types
      trackExternalConversion('signup', {
        signup_method: 'quiz_completion',
        quiz_result: quizResult,
        source: 'quiz'
      });
      
      // Submit to our backend API which will forward to ConvertKit
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          firstName: '',
          quiz_result: quizResult,
          source: 'quiz'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit to waitlist');
      }
      
      alert("Thank you for joining our waitlist! We'll send you personalized resources based on your quiz results.");
    } catch (error) {
      console.error("Error submitting to ConvertKit:", error);
      alert("There was an error submitting your email. Please try again later.");
    }
  };

  return (
    <section id="quiz" className="bg-gray-900 text-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 scroll-animation">
          Are You Ready for Tech?
        </h2>
        <p className="text-lg text-center max-w-2xl mx-auto mb-12 scroll-animation">
          Take our quick assessment to find out where you stand and get personalized recommendations
        </p>
        
        <div className="max-w-2xl mx-auto bg-gray-800 text-white rounded-xl shadow-lg p-8 scroll-animation">
          <div id="quiz-container">
            {quizState === "start" && (
              <div id="quiz-start" className="text-center">
                <h3 className="text-2xl font-bold mb-6">Tech Career Readiness Quiz</h3>
                <p className="mb-8">Answer 5 quick questions to see if you're ready to break into tech and what next steps are right for you.</p>
                <button 
                  onClick={startQuiz}
                  className="bg-[#06D6A0] hover:bg-[#05c090] px-8 py-4 rounded-full font-bold text-gray-900 transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            )}
            
            {quizState === "questions" && (
              <form id="quiz-questions" onSubmit={handleSubmit(calculateResult)}>
                {questions.map((q, index) => (
                  <div 
                    key={q.id} 
                    className={`question ${currentQuestion === q.id ? '' : 'hidden'}`}
                  >
                    <h3 className="text-xl font-bold mb-4">{q.id}. {q.question}</h3>
                    <div className="space-y-3">
                      {q.options.map((option) => (
                        <label key={option.value} className="block p-3 border border-gray-600 rounded-lg hover:bg-gray-700 cursor-pointer text-gray-200">
                          <input 
                            type="radio" 
                            {...register(`q${q.id}`)} 
                            value={option.value} 
                            className="mr-2" 
                          /> 
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="mt-8 flex justify-between">
                  <button 
                    type="button"
                    id="prev-question" 
                    className={`${currentQuestion === 1 ? 'invisible' : ''} px-6 py-2 border border-gray-500 rounded-full font-medium text-gray-300 hover:bg-gray-700 transition-colors`}
                    onClick={prevQuestion}
                  >
                    Previous
                  </button>
                  
                  {currentQuestion < 5 ? (
                    <button 
                      type="button"
                      id="next-question" 
                      className="px-6 py-2 bg-[#06D6A0] hover:bg-[#05c090] rounded-full font-bold text-[#333333] transition-colors"
                      onClick={nextQuestion}
                    >
                      Next Question
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      id="submit-quiz" 
                      className="px-6 py-2 bg-[#06D6A0] hover:bg-[#05c090] rounded-full font-bold text-[#333333] transition-colors"
                    >
                      See My Results
                    </button>
                  )}
                </div>
              </form>
            )}
            
            {quizState === "results" && (
              <div id="quiz-results">
                {quizResult === "ready" && (
                  <div id="result-ready" className="result-panel">
                    <div className="text-center mb-8">
                      <div className="inline-block bg-[#06D6A0] text-white p-3 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">You're Ready!</h3>
                      <p className="text-lg mb-4">Your answers show you're prepared to make the transition into tech.</p>
                    </div>
                    
                    <div className="bg-gray-700 p-6 rounded-lg mb-6">
                      <h4 className="font-bold mb-2 text-white">Next Steps:</h4>
                      <p className="text-gray-300">Book your free strategy call to discuss your specific situation and get personalized advice on transitioning to tech.</p>
                    </div>
                    
                    <div className="text-center">
                      <a 
                        href="#book-call" 
                        className="inline-block px-8 py-4 bg-[#06D6A0] hover:bg-[#05c090] rounded-full font-bold text-[#333333] transition-colors"
                        onClick={() => {
                          trackCTAClick('book_strategy_call', 'quiz_result_ready');
                          trackExternalConversion('qualification', {
                            location: 'quiz_result',
                            action: 'book_strategy_call',
                            quiz_result: 'ready'
                          });
                        }}
                      >
                        Book Free Strategy Call
                      </a>
                    </div>
                  </div>
                )}
                
                {quizResult === "almost" && (
                  <div id="result-almost" className="result-panel">
                    <div className="text-center mb-8">
                      <div className="inline-block bg-[#06D6A0] text-white p-3 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">You're Almost There!</h3>
                      <p className="text-lg mb-4">You have potential but need some guidance to make a successful transition.</p>
                    </div>
                    
                    <div className="bg-gray-700 p-6 rounded-lg mb-6">
                      <h4 className="font-bold mb-2 text-white">Next Steps:</h4>
                      <p className="text-gray-300">Book a free strategy call to discuss your specific situation and get personalized advice.</p>
                    </div>
                    
                    <div className="text-center">
                      <a 
                        href="#book-call" 
                        className="inline-block px-8 py-4 bg-[#06D6A0] hover:bg-[#05c090] rounded-full font-bold text-[#333333] transition-colors"
                        onClick={() => {
                          trackCTAClick('book_strategy_call', 'quiz_result_almost');
                          trackExternalConversion('try_demo', {
                            demo_type: 'strategy_call',
                            source: 'quiz_result',
                            quiz_result: 'almost'
                          });
                        }}
                      >
                        Book Free Strategy Call
                      </a>
                    </div>
                  </div>
                )}
                
                {quizResult === "curious" && (
                  <div id="result-curious" className="result-panel">
                    <div className="text-center mb-8">
                      <div className="inline-block bg-[#06D6A0] text-white p-3 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">You're Curious!</h3>
                      <p className="text-lg mb-4">You're just starting to explore tech careers but need more information.</p>
                    </div>
                    
                    <div className="bg-gray-700 p-6 rounded-lg mb-6">
                      <h4 className="font-bold mb-2 text-white">Next Steps:</h4>
                      <p className="text-gray-300">Join our waitlist to get free resources and guidance on beginning your tech journey.</p>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-sm text-gray-400 mb-4">Sign up to receive curated resources and guidance to help you get started.</p>
                      
                      <form className="mt-6" onSubmit={handleSubmit(submitWaitlistEmail)}>
                        <div className="flex flex-col md:flex-row gap-4">
                          <input 
                            type="email" 
                            placeholder="Your email address" 
                            className="flex-grow px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06D6A0]"
                            {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })}
                          />
                          <button 
                            type="submit" 
                            className="px-6 py-3 bg-[#06D6A0] hover:bg-[#05c090] rounded-full font-bold text-[#333333] transition-colors whitespace-nowrap"
                          >
                            Join Free Resource List
                          </button>
                        </div>
                        {errors.email && <p className="text-red-500 mt-2 text-sm">{errors.email.message}</p>}
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
