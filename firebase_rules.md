# Firebase Firestore Security Rules

## Regras de Segurança do Firestore

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função auxiliar para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função auxiliar para verificar se o usuário é o dono do recurso
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Função auxiliar para validar campos obrigatórios
    function hasRequiredFields(fields) {
      return request.resource.data.keys().hasAll(fields);
    }
    
    // ============================================
    // COLEÇÃO: users
    // Perfis de usuários
    // ============================================
    match /users/{userId} {
      // Permitir leitura se estiver autenticado
      allow read: if isAuthenticated();
      
      // Permitir criação apenas do próprio perfil
      allow create: if isOwner(userId) 
                    && hasRequiredFields(['displayName', 'fullName', 'email'])
                    && request.resource.data.displayName is string
                    && request.resource.data.displayName.size() >= 3
                    && request.resource.data.displayName.size() <= 20
                    && request.resource.data.displayName.matches('^[a-z0-9]+$')
                    && request.resource.data.fullName is string
                    && request.resource.data.fullName.size() > 0
                    && request.resource.data.email is string
                    && request.resource.data.email.matches('^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$');
      
      // Permitir atualização apenas do próprio perfil
      allow update: if isOwner(userId)
                    && request.resource.data.displayName is string
                    && request.resource.data.displayName.size() >= 3
                    && request.resource.data.displayName.size() <= 20
                    && request.resource.data.displayName.matches('^[a-z0-9]+$')
                    && request.resource.data.fullName is string
                    && request.resource.data.fullName.size() > 0;
      
      // Permitir exclusão apenas do próprio perfil
      allow delete: if isOwner(userId);
    }
    
    // ============================================
    // COLEÇÃO: ratings
    // Avaliações de prestadores de serviços
    // ============================================
    match /ratings/{ratingId} {
      // Permitir leitura se estiver autenticado
      allow read: if isAuthenticated();
      
      // Permitir criação se estiver autenticado e for o próprio usuário
      allow create: if isAuthenticated()
                    && hasRequiredFields(['prestadorWhatsapp', 'prestadorNome', 'servico', 'rating', 'comment', 'userId', 'userName'])
                    && isOwner(request.resource.data.userId)
                    && request.resource.data.rating is number
                    && request.resource.data.rating >= 1
                    && request.resource.data.rating <= 5
                    && request.resource.data.prestadorWhatsapp is string
                    && request.resource.data.prestadorWhatsapp.size() > 0
                    && request.resource.data.prestadorNome is string
                    && request.resource.data.prestadorNome.size() > 0
                    && request.resource.data.servico is string
                    && request.resource.data.servico.size() > 0
                    && request.resource.data.comment is string
                    && request.resource.data.userName is string;
      
      // Permitir atualização apenas do próprio rating
      allow update: if isAuthenticated()
                    && isOwner(resource.data.userId)
                    && request.resource.data.userId == resource.data.userId
                    && request.resource.data.prestadorWhatsapp == resource.data.prestadorWhatsapp
                    && request.resource.data.rating is number
                    && request.resource.data.rating >= 1
                    && request.resource.data.rating <= 5;
      
      // Permitir exclusão apenas do próprio rating
      allow delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // ============================================
    // COLEÇÃO: reports
    // Denúncias de avaliações
    // ============================================
    match /reports/{reportId} {
      // Permitir leitura apenas para administradores (no frontend não há leitura direta)
      allow read: if false;
      
      // Permitir criação se estiver autenticado e for o próprio usuário
      allow create: if isAuthenticated()
                    && hasRequiredFields(['ratingId', 'reporterId', 'reason'])
                    && isOwner(request.resource.data.reporterId)
                    && request.resource.data.reason in ['fake', 'offensive', 'spam', 'other']
                    && request.resource.data.ratingId is string
                    && request.resource.data.ratingId.size() > 0;
      
      // Não permitir atualização de denúncias
      allow update: if false;
      
      // Não permitir exclusão de denúncias (apenas admin via console)
      allow delete: if false;
    }
  }
}
```

## Instruções de Aplicação

### Via Firebase Console:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **brasiguaios-a9ddf**
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras** (Rules)
5. Copie e cole as regras acima
6. Clique em **Publicar** (Publish)

### Via Firebase CLI:

1. Crie um arquivo `firestore.rules` na raiz do projeto
2. Copie as regras acima para o arquivo
3. Execute:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Resumo das Regras

### Coleção `users`
- **Leitura**: Qualquer usuário autenticado
- **Criação**: Apenas o próprio usuário, com validação de displayName (3-20 caracteres, apenas letras minúsculas e números)
- **Atualização**: Apenas o próprio usuário
- **Exclusão**: Apenas o próprio usuário

### Coleção `ratings`
- **Leitura**: Qualquer usuário autenticado
- **Criação**: Apenas usuários autenticados, para suas próprias avaliações (rating entre 1-5)
- **Atualização**: Apenas o autor da avaliação (não pode alterar prestadorWhatsapp, userId)
- **Exclusão**: Apenas o autor da avaliação

### Coleção `reports`
- **Leitura**: Negado (apenas admin via console)
- **Criação**: Usuários autenticados podem criar denúncias com motivo válido
- **Atualização**: Negado
- **Exclusão**: Negado (apenas admin via console)

## Campos Validados

### User Profile
- `displayName`: string, 3-20 caracteres, apenas letras minúsculas e números
- `fullName`: string, obrigatório, mínimo 1 caractere
- `email`: string, formato de email válido
- `phoneNumber`: string (opcional)

### Rating
- `prestadorWhatsapp`: string, obrigatório
- `prestadorNome`: string, obrigatório
- `servico`: string, obrigatório
- `rating`: number, 1-5
- `comment`: string
- `userId`: string, obrigatório (deve ser o próprio usuário)
- `userName`: string, obrigatório

### Report
- `ratingId`: string, obrigatório
- `reporterId`: string, obrigatório (deve ser o próprio usuário)
- `reason`: string, valores: 'fake', 'offensive', 'spam', 'other'
- `description`: string (opcional)

