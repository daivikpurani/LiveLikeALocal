from trulens.apps.langchain import TruChain
from trulens.providers.openai import OpenAI
from trulens.feedback.feedback import Feedback
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
import pandas as pd
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TruLensEvaluator:
    def __init__(self):
        # Initialize OpenAI provider
        self.openai = OpenAI()
        
        # Initialize feedback functions
        self.feedback = Feedback(
            self.openai.relevance,
            self.openai.correctness,
            self.openai.helpfulness
        ).on_input_output()
        
        # Initialize LangChain
        llm = ChatOpenAI(temperature=0)
        prompt = PromptTemplate(
            input_variables=["query"],
            template="You are a helpful travel assistant. Answer the following question about San Francisco: {query}"
        )
        chain = LLMChain(llm=llm, prompt=prompt)
        
        # Initialize TruChain
        self.tru_chain = TruChain(
            chain=chain,
            app_id="travel_chat",
            feedbacks=[self.feedback]
        )

    def evaluate_response(self, query, response):
        """Evaluate a single response using TruLens metrics"""
        record = self.tru_chain.add_record(
            input=query,
            output=response
        )
        
        # Get feedback scores
        feedback_results = record.feedback_results()
        
        return {
            'relevance': feedback_results['relevance'],
            'correctness': feedback_results['correctness'],
            'helpfulness': feedback_results['helpfulness']
        }

    def run_evaluation(self, input_csv='sf_users_personas.csv', output_csv='truLens_results.csv'):
        """Run evaluation on all queries in the CSV file"""
        # Read input CSV
        df = pd.read_csv(input_csv)
        
        results = []
        for index, row in df.iterrows():
            query = row['query']
            # Simulate response (replace with actual LLM call)
            response = f"Here are some great recommendations for San Francisco based on your query: {query}"
            
            # Evaluate response
            evaluation = self.evaluate_response(query, response)
            
            # Store results
            results.append({
                'query': query,
                'response': response,
                'relevance_score': evaluation['relevance'],
                'correctness_score': evaluation['correctness'],
                'helpfulness_score': evaluation['helpfulness']
            })
            
            # Print progress
            print(f"Processed {index + 1}/{len(df)} queries")
            print(f"Latest scores: Relevance={evaluation['relevance']:.2f}, "
                  f"Correctness={evaluation['correctness']:.2f}, "
                  f"Helpfulness={evaluation['helpfulness']:.2f}")
        
        # Save results
        results_df = pd.DataFrame(results)
        results_df.to_csv(output_csv, index=False)
        
        # Print summary
        print("\n=== TruLens Evaluation Summary ===")
        print(f"Total Queries Processed: {len(results)}")
        print(f"Average Relevance Score: {results_df['relevance_score'].mean():.2%}")
        print(f"Average Correctness Score: {results_df['correctness_score'].mean():.2%}")
        print(f"Average Helpfulness Score: {results_df['helpfulness_score'].mean():.2%}")
        print("================================")

if __name__ == "__main__":
    evaluator = TruLensEvaluator()
    evaluator.run_evaluation() 