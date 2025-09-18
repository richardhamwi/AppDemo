import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions } from "react-native";
import { Provider as PaperProvider, Text, Button } from "react-native-paper";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [playerY, setPlayerY] = useState(height - 150);
  const [jumping, setJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gravity = 6;
  const jumpHeight = 120;
  const obstacleSpeed = 5;
  const obstacleInterval = useRef(null);
  const gameLoop = useRef(null);

  // Start the game
  useEffect(() => {
    if (!gameOver) {
      // Spawn obstacles every 2s
      obstacleInterval.current = setInterval(() => {
        setObstacles((prev) => [
          ...prev,
          { x: width, y: height - 150, width: 40, height: 40 },
        ]);
      }, 2000);

      // Game loop
      gameLoop.current = setInterval(() => {
        setObstacles((prev) =>
          prev
            .map((o) => ({ ...o, x: o.x - obstacleSpeed }))
            .filter((o) => o.x + o.width > 0) // remove offscreen
        );
        setScore((s) => s + 1);
      }, 30);
    }

    return () => {
      clearInterval(obstacleInterval.current);
      clearInterval(gameLoop.current);
    };
  }, [gameOver]);

  // Handle jump
  const jump = () => {
    if (jumping || gameOver) return;
    setJumping(true);

    let startY = playerY;
    let upInterval = setInterval(() => {
      setPlayerY((y) => {
        if (startY - y >= jumpHeight) {
          clearInterval(upInterval);

          // fall down
          let downInterval = setInterval(() => {
            setPlayerY((y) => {
              if (y >= height - 150) {
                clearInterval(downInterval);
                setJumping(false);
                return height - 150;
              }
              return y + gravity;
            });
          }, 30);
        }
        return y - gravity;
      });
    }, 30);
  };

  // Collision detection
  useEffect(() => {
    obstacles.forEach((o) => {
      if (
        o.x < 50 + 40 && // player right edge
        o.x + o.width > 50 && // player left edge
        o.y < playerY + 40 && // player bottom
        o.y + o.height > playerY // player top
      ) {
        setGameOver(true);
      }
    });
  }, [obstacles, playerY]);

  const resetGame = () => {
    setPlayerY(height - 150);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
  };

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={jump}>
        <View style={styles.container}>
          {/* Player */}
          <View style={[styles.player, { top: playerY }]} />

          {/* Obstacles */}
          {obstacles.map((o, i) => (
            <View
              key={i}
              style={[
                styles.obstacle,
                { left: o.x, top: o.y, width: o.width, height: o.height },
              ]}
            />
          ))}

          {/* Score */}
          <Text style={styles.score}>Score: {score}</Text>

          {/* Game Over */}
          {gameOver && (
            <View style={styles.overlay}>
              <Text style={{ fontSize: 28, marginBottom: 16 }}>Game Over</Text>
              <Button mode="contained" onPress={resetGame}>
                Restart
              </Button>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
  },
  player: {
    position: "absolute",
    left: 50,
    width: 40,
    height: 40,
    backgroundColor: "#6200ea",
    borderRadius: 8,
  },
  obstacle: {
    position: "absolute",
    backgroundColor: "#d32f2f",
    borderRadius: 4,
  },
  score: {
    position: "absolute",
    top: 50,
    left: 20,
    fontSize: 22,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: height / 2 - 100,
    left: width / 2 - 100,
    width: 200,
    height: 200,
    backgroundColor: "white",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
