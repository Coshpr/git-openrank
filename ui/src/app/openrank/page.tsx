import CountryRanking from './components/CountryRanking';
import CompanyRanking from './components/CompanyRanking';
import ProjectRanking from './components/ProjectRanking';
import DeveloperRanking from './components/DeveloperRanking';
import { openatom_metrics } from './metric';
import RankingCard from './components/RankingCard';

export default async function DashboardPage() {
  const fetchData = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  };

  // 提取URL查找逻辑，使代码更清晰
  const getUrlByName = (name: string): string => {
    const metric = openatom_metrics.find(m => m.name === name);
    if (!metric) {
      throw new Error(`Metric with name "${name}" not found`);
    }
    return metric.url;
  };

  const [countryData, companyData, projectData, developerData] =
    await Promise.all([
      fetchData(getUrlByName('country_list')),
      fetchData(getUrlByName('company_list')),
      fetchData(getUrlByName('project_list_china')),
      fetchData(getUrlByName('developers_list')),
    ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-6xl mx-auto ">
        <h1 className="text-3xl font-bold mb-8 text-center">OpenSource Rank</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <RankingCard title="Global Open Source Developer Ranking">
            <CountryRanking data={countryData} />
          </RankingCard>
          <RankingCard title="Open Source Companies Ranking">
            <CompanyRanking data={companyData} />
          </RankingCard>
          <RankingCard title="China Open Source Projects Ranking">
            <ProjectRanking data={projectData} />
          </RankingCard>

          <RankingCard title="Global Open Source Developer Ranking">
            <DeveloperRanking data={developerData} />
          </RankingCard>
        </div>
      </div>
    </div>
  );
}
