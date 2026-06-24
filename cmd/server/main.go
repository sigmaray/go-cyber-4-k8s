package main

import (
	"log"
	"os"

	"github.com/foobar/go-cyber-4-k8s/internal/database"
	"github.com/foobar/go-cyber-4-k8s/internal/handlers"
	"github.com/gin-gonic/gin"
)

func main() {
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("database: %v", err)
	}

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.LoadHTMLGlob("templates/*")

	h := &handlers.TaskHandler{DB: db}

	r.GET("/health", h.Health)

	r.GET("/", h.ListPage)
	r.POST("/tasks", h.Create)
	r.POST("/tasks/:id/update", h.Update)
	r.POST("/tasks/:id/delete", h.Delete)

	api := r.Group("/api")
	{
		api.GET("/tasks", h.ListAPI)
		api.POST("/tasks", h.CreateAPI)
		api.PUT("/tasks/:id", h.UpdateAPI)
		api.DELETE("/tasks/:id", h.DeleteAPI)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("server listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server: %v", err)
	}
}
