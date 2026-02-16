import os
from crewai import Crew, Process
from agents import TravelAgents
from tasks import TravelTasks
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Force OpenAI SDK to use DeepSeek configuration
os.environ["OPENAI_API_KEY"] = os.getenv("DEEPSEEK_API_KEY")
os.environ["OPENAI_API_BASE"] = "https://api.deepseek.com"
os.environ["OPENAI_BASE_URL"] = "https://api.deepseek.com"

def main():
    print("## Welcome to the Travel AI Planner ##")
    print("--------------------------------------")

    agents = TravelAgents()
    tasks = TravelTasks()

    # Instantiate Agents
    researcher = agents.destination_researcher()
    planner = agents.itinerary_planner()

    # Instantiate Tasks
    research_task = tasks.research_task(researcher)
    planning_task = tasks.planning_task(planner, [research_task])

    # Create Crew
    travel_crew = Crew(
        agents=[researcher, planner],
        tasks=[research_task, planning_task],
        process=Process.sequential,
        verbose=True
    )

    # Kickoff
    inputs = {'city': '西安', 'days': 3}
    result = travel_crew.kickoff(inputs=inputs)

    print("\n\n########################")
    print("## Here is your Trip Plan ##")
    print("########################\n")
    print(result)

if __name__ == "__main__":
    main()
