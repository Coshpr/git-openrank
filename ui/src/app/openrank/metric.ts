interface Metric {
  name: string;
  url: string;
  type: 'json' | 'csv';
  key: string;
}

const base_url = 'https://oss.open-digger.cn/openatom/';

export const openatom_metrics: Metric[] = [
  {
    name: 'country_list',
    url: base_url + 'country_list.json',
    type: 'json',
    key: 'name',
  },
  {
    name: 'project_list_china',
    url: base_url + 'project_list_china.json',
    type: 'json',
    key: 'name',
  },
  {
    name: 'company_list',
    url: base_url + 'company_list.json',
    type: 'json',
    key: 'name',
  },
  {
    name: 'developers_list',
    url: base_url + 'developers_list.json',
    type: 'json',
    key: 'name',
  },
];
