pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-registry'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    tools {
        maven 'Maven-3.9'
        jdk   'JDK-17'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean compile -pl user-service,account-service,transaction-service,loan-service,notification-service,fraud-detection-service'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'mvn test -pl user-service,account-service,transaction-service,loan-service'
            }
            post {
                always { junit '**/target/surefire-reports/*.xml' }
            }
        }

        stage('Package') {
            steps {
                sh 'mvn package -DskipTests'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    def services = ['api-gateway','user-service','account-service','transaction-service','loan-service','notification-service','fraud-detection-service','frontend']
                    services.each { svc ->
                        sh "docker build -t ${DOCKER_REGISTRY}/${svc}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${svc}:latest ./${svc}"
                    }
                }
            }
        }

        stage('Docker Push') {
            when { branch 'main' }
            steps {
                withCredentials([usernamePassword(credentialsId:'docker-creds',usernameVariable:'USER',passwordVariable:'PASS')]) {
                    sh 'echo $PASS | docker login $DOCKER_REGISTRY -u $USER --password-stdin'
                    script {
                        ['api-gateway','user-service','account-service','transaction-service','loan-service','notification-service','fraud-detection-service'].each { svc ->
                            sh "docker push ${DOCKER_REGISTRY}/${svc}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                sh '''
                    docker-compose down --remove-orphans || true
                    docker-compose up -d
                    sleep 60
                    docker-compose ps
                '''
            }
        }
    }

    post {
        success { echo '✅ BankFlow pipeline completed!' }
        failure { echo '❌ BankFlow pipeline failed!' }
        always  { cleanWs() }
    }
}