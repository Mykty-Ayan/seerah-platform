package cloudflare

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

const (
	baseURL       = "https://api.cloudflare.com/client/v4/accounts"
	accountID     = "49dae848c6685c6b4d74b39fc6b602a7"
	streamBaseURL = baseURL + "/" + accountID + "/stream"
)

type StreamClient struct {
	apiToken string
}

type UploadResponse struct {
	Success bool   `json:"success"`
	Result  struct {
		UID              string  `json:"uid"`
		DownloadURL      string  `json:"downloadUrl"`
		Duration         float64 `json:"duration"`
		Size             int64   `json:"size"`
		Input            struct {
			Width  int `json:"width"`
			Height int `json:"height"`
		} `json:"input"`
		Thumbnail struct {
			Timestamp float64 `json:"timestamp"`
		} `json:"thumbnail"`
		Created    string `json:"created"`
		Modified   string `json:"modified"`
		Uploaded   string `json:"uploaded"`
		State      string `json:"state"`
		Status     struct {
			State       string  `json:"state"`
			PctComplete float64 `json:"pctComplete"`
		} `json:"status"`
		Meta map[string]interface{} `json:"meta"`
	} `json:"result"`
}

type VideoInfo struct {
	UID          string  `json:"uid"`
	Duration     float64 `json:"duration"`
	Size         int64   `json:"size"`
	State        string  `json:"state"`
	DownloadURL  string  `json:"downloadUrl"`
	ThumbnailURL string  `json:"thumbnail"`
	Meta         map[string]interface{} `json:"meta"`
}

type ListVideosResponse struct {
	Success bool          `json:"success"`
	Result  []VideoInfo   `json:"result"`
}

func NewStreamClient() *StreamClient {
	return &StreamClient{
		apiToken: os.Getenv("CLOUDFLARE_API_TOKEN"),
	}
}

// UploadVideo uploads a video file to Cloudflare Stream
func (c *StreamClient) UploadVideo(filePath string, name string) (*UploadResponse, error) {
	// Create multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	// Add file
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()
	
	part, err := writer.CreateFormFile("file", filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}
	
	_, err = io.Copy(part, file)
	if err != nil {
		return nil, fmt.Errorf("failed to copy file: %w", err)
	}
	
	// Add metadata
	if name != "" {
		_ = writer.WriteField("name", name)
	}
	
	err = writer.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close writer: %w", err)
	}
	
	// Make request
	req, err := http.NewRequest("POST", streamBaseURL, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()
	
	var uploadResp UploadResponse
	if err := json.NewDecoder(resp.Body).Decode(&uploadResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	if !uploadResp.Success {
		return nil, fmt.Errorf("upload failed")
	}
	
	return &uploadResp, nil
}

// GetVideo gets video info by UID
func (c *StreamClient) GetVideo(uid string) (*VideoInfo, error) {
	url := fmt.Sprintf("%s/%s", streamBaseURL, uid)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var result struct {
		Success bool       `json:"success"`
		Result  VideoInfo  `json:"result"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	if !result.Success {
		return nil, fmt.Errorf("failed to get video")
	}
	
	return &result.Result, nil
}

// ListVideos lists all videos
func (c *StreamClient) ListVideos() ([]VideoInfo, error) {
	req, err := http.NewRequest("GET", streamBaseURL, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var result ListVideosResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	return result.Result, nil
}

// DeleteVideo deletes a video by UID
func (c *StreamClient) DeleteVideo(uid string) error {
	url := fmt.Sprintf("%s/%s", streamBaseURL, uid)
	
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}
	
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	return nil
}

// GetStreamURL returns the Cloudflare Stream embed URL for a video
func GetStreamURL(uid string) string {
	return fmt.Sprintf("https://customer-49dae848c6685c6b4d74b39fc6b602a7.cloudflarestream.com/%s/iframe", uid)
}

// GetThumbnailURL returns the thumbnail URL for a video
func GetThumbnailURL(uid string) string {
	return fmt.Sprintf("https://customer-49dae848c6685c6b4d74b39fc6b602a7.cloudflarestream.com/%s/thumbnails/thumbnail.jpg", uid)
}
