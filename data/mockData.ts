import { Provider, Category } from '../types';

export const categories: Category[] = [
    { icon: 'construction', name: 'Reformas' },
    { icon: 'celebration', name: 'Eventos' },
    { icon: 'school', name: 'Aulas' },
    { icon: 'cleaning_services', name: 'Limpeza' },
    { icon: 'electric_bolt', name: 'Elétrica' },
    { icon: 'brush', name: 'Beleza' },
    { icon: 'local_shipping', name: 'Transporte' },
    { icon: 'plumbing', name: 'Hidráulica' },
    { icon: 'pets', name: 'Pets' },
    { icon: 'devices', name: 'Tecnologia' },
    { icon: 'lightbulb', name: 'Consultoria' },
    { icon: 'health_and_safety', name: 'Saúde' },
    { icon: 'directions_car', name: 'Automotivo' },
    { icon: 'yard', name: 'Jardinagem' },
    { icon: 'restaurant', name: 'Gastronomia' },
    { icon: 'palette', name: 'Design' },
    { icon: 'photo_camera', name: 'Fotografia' },
    { icon: 'music_note', name: 'Música' },
    { icon: 'inventory_2', name: 'Mudanças' },
];

export const providers: Provider[] = [
    // Eletricistas (Originais)
    {
        id: 1,
        name: 'João da Silva',
        category: 'Elétrica',
        description: 'Especialista em instalações residenciais.',
        rating: 4.8,
        reviewsCount: 120,
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBlyWj3kv_Ocjr8RaoTdnW_waOhhYhM3tkAhsL7JT_PEItTvP1uXgcmgjadmMFdgqCvkfGK7iW1H7ipUqG_w-bSiv8ml1uIxs7c3NIFZ59ycKPqqk2ZlqxcGKyB5wRTV3egbdVgn50AG1iN8xjqIFftD_9uuH1xZlH1joM8f-e9QujKhkGQ8CH49JVINd1QD45N8Jpk6AulvBNfZWcGnC9KezdVuWNuKb7wwcfjzPFatzMIXRC8hGXpZQ8ZBF2zbKFP0t9BRHIOB8g',
        location: 'São Paulo'
    },
    {
        id: 2,
        name: 'Maria Oliveira',
        category: 'Elétrica',
        description: 'Manutenção elétrica comercial e predial.',
        rating: 4.5,
        reviewsCount: 98,
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuA7SmU-JkLJObYGLMIXzEwY0MKbAK-EEBZHwdK4T5O-tYyidb0iZ54rEXGM8WL_CV5bRBjAkXVuU_veZ8l6sOTWJ7g_70peaR08Z09Zyncg4NMgd3inxBzNt39Gu_VUMErDHwU37TR_49QZSXOznK6PY8ob72J8-N1I25w9jniPeJyXeTKy8C2J5qfpTsxZ3wLV_UVm8_dg3z76vG4CK1t-ybcmFO2amRAAbTCycxF3c9fWhd7soVUp-PGFbeIxztQG_aJM_IVmX9s',
        location: 'Rio de Janeiro'
    },
    {
        id: 3,
        name: 'Carlos Pereira',
        category: 'Elétrica',
        description: 'Reparos urgentes 24 horas.',
        rating: 4.9,
        reviewsCount: 215,
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuC4rfJaZvMcmRyUvugUC4H9LnqijN4lNPlBtNWjHiPWyIOP839wkFtNbp0OodZpVnybQAiDPAKp_FYgneh27ZIhmkUe7cDtCJXiKZZCzwQ5JheyvJ5v90xi2BvHZwDBkKAPJUjnnV6BhgDg_kl1f62SBjhn_qgwP3WcEvQrMjaNMmLWGuY3pCAfm8201y4WVfg8zVfzhLIkDS6c7h8-xaqrIB8UQK0_lVWrWO6eZSbvBZUpYUgdVEgM2ziDzdl0p-9YvzC7qkes4BQ',
        location: 'São Paulo'
    },
    {
        id: 4,
        name: 'Ana Costa',
        category: 'Elétrica',
        description: 'Projetos de iluminação e automação.',
        rating: 4.7,
        reviewsCount: 88,
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBzObjoApVAnXdbl_qUTMD75J4bTI1yZjVXWYDxk1XpthFbV4ZCiUxzpaBs833DWb1guJHtGDJXjUx3KdXxcFoLc3QfblSji1H5BesGPTeiyTZHNvO3TCoOWe6NqR3bCUewkyu1LKRlJl5dVTNo6ymMs7lZgXnuZeMT3BHIS7kGer09B5jOzMMQeJCr2T5xOcgLa18PooOwULhHsbUOlN1rmiW6DjGQOHFBMZyaDSjDov2rSdUC84Rizte6GKPi92SAHbNhH5kjibE',
        location: 'Belo Horizonte'
    },
    {
        id: 5,
        name: 'Ricardo Lima',
        category: 'Elétrica',
        description: 'Sistemas de segurança e CFTV.',
        rating: 4.6,
        reviewsCount: 75,
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBqgYFpNGPD8OUoOJcN4HNjbjSkAqYxU0w6x5eP7P89Fv28RrCX6ADiZhgWk7D1CRfnzTvFjj8O7DRzq8R_JgGFNEc1LJunQKAN8K4u-3swpPVOQmwuvq8AD-Eja-_gB-MKApHvA_Q5nUeI_Gw1n8LPx3LcUIvdUskvWpzYfTfA4kAMIQXxmHCgt5diqg1Dx-NOE_gXFKw4pQkqblwSXGGg-pEJ5Ip4A4tCSeeZHepUowyqsXa-Lyb7UGwQ7woOOgSLnI_GExHFI8s',
        location: 'Rio de Janeiro'
    },
    {
        id: 6,
        name: 'Fernanda Alves',
        category: 'Elétrica',
        description: 'Atendimento rápido e eficiente.',
        rating: 5.0,
        reviewsCount: 150,
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBlV3aL5rUVBfyOmvGpntqlCw3_nmXpXMl_yM8La9fYYD4FjKHHim_1W31TtQ2GSe1fcOdfeq_A6ypHbKTYF4_mYJYFHNLmZLiMciw_Dnbc0oGtwADucWbU3BWVUcpaeLHHQ_3muvcSQUw5z5KsqWcrVK0cJcce1psyyn0vQ_7vCipYXPRPeQkyELy2MAp0nWDSRBCSHZz5VMjSKtdMmv3mvO5JJUDn7raQeVrHNlHu6hQ2Gw_EahRvYXT3tM78iZPOZ5wB_xNvFnI',
        location: 'Curitiba'
    },
    // Novos Prestadores (Variações)
    {
        id: 7,
        name: 'Roberto Souza',
        category: 'Reformas',
        description: 'Pedreiro e pintor com 20 anos de experiência.',
        rating: 4.9,
        reviewsCount: 310,
        imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'São Paulo'
    },
    {
        id: 8,
        name: 'Cláudia Martins',
        category: 'Limpeza',
        description: 'Limpeza residencial e pós-obra detalhada.',
        rating: 4.8,
        reviewsCount: 150,
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Rio de Janeiro'
    },
    {
        id: 9,
        name: 'Marcos Vinícius',
        category: 'Tecnologia',
        description: 'Suporte técnico, formatação e redes.',
        rating: 5.0,
        reviewsCount: 45,
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Florianópolis'
    },
    {
        id: 10,
        name: 'Patrícia Lima',
        category: 'Beleza',
        description: 'Maquiadora profissional e designer de sobrancelhas.',
        rating: 4.7,
        reviewsCount: 220,
        imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Belo Horizonte'
    },
    {
        id: 11,
        name: 'Lucas Mendes',
        category: 'Aulas',
        description: 'Aulas particulares de Matemática e Física.',
        rating: 4.9,
        reviewsCount: 80,
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'São Paulo'
    },
    {
        id: 12,
        name: 'Juliana Costa',
        category: 'Eventos',
        description: 'Organização de festas, casamentos e buffet.',
        rating: 4.6,
        reviewsCount: 112,
        imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Curitiba'
    },
    {
        id: 13,
        name: 'André Santos',
        category: 'Transporte',
        description: 'Fretes e mudanças para todo o estado.',
        rating: 4.8,
        reviewsCount: 340,
        imageUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Porto Alegre'
    },
    {
        id: 14,
        name: 'Camila Rocha',
        category: 'Pets',
        description: 'Dog walker e pet sitter com muito amor.',
        rating: 5.0,
        reviewsCount: 67,
        imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Rio de Janeiro'
    },
    {
        id: 15,
        name: 'Rafael Nogueira',
        category: 'Hidráulica',
        description: 'Encanador experiente, caça-vazamentos.',
        rating: 4.7,
        reviewsCount: 134,
        imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Salvador'
    },
    {
        id: 16,
        name: 'Beatriz Almeida',
        category: 'Consultoria',
        description: 'Consultoria financeira pessoal e empresarial.',
        rating: 4.9,
        reviewsCount: 55,
        imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'São Paulo'
    },
    {
        id: 17,
        name: 'Gustavo Ferreira',
        category: 'Reformas',
        description: 'Pintura residencial e texturas modernas.',
        rating: 4.8,
        reviewsCount: 99,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Brasília'
    },
    {
        id: 18,
        name: 'Larissa Ribeiro',
        category: 'Beleza',
        description: 'Cabeleireira especialista em cortes e coloração.',
        rating: 4.9,
        reviewsCount: 210,
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Recife'
    },
    {
        id: 19,
        name: 'Felipe Barbosa',
        category: 'Tecnologia',
        description: 'Desenvolvimento de sites e aplicativos.',
        rating: 5.0,
        reviewsCount: 30,
        imageUrl: 'https://images.unsplash.com/photo-1533227297135-e08819163841?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'São Paulo'
    },
    {
        id: 20,
        name: 'Mariana Duarte',
        category: 'Aulas',
        description: 'Professora de Inglês e Espanhol.',
        rating: 4.8,
        reviewsCount: 140,
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Fortaleza'
    },
    {
        id: 21,
        name: 'Thiago Martins',
        category: 'Pets',
        description: 'Adestrador comportamental de cães.',
        rating: 4.9,
        reviewsCount: 180,
        imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        location: 'Curitiba'
    }
];
